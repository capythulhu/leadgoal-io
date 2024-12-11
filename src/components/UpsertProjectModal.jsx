import {
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
} from "antd";
import React, { useState } from "react";
import { useApi } from "../providers/Api";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

function UpsertProjectModal({ isOpen, onClose }) {
  const { addProject, updateProject, project, isLoading } = useApi();
  const [form] = Form.useForm();

  const isEditing = !!project;

  return (
    <Modal
      title={project ? "Edit Project" : "Create Project"}
      open={isOpen || !isEditing}
      confirmLoading={isLoading} // Note: "loading" prop is not valid on Modal, use "confirmLoading"
      onOk={form.submit}
      onCancel={onClose}
      closable={isEditing}
      cancelButtonProps={isEditing ? {} : { style: { display: "none" } }}
      centered
    >
      <Divider />
      <Form
        form={form}
        initialValues={{
          ...project,
          timeFrame: project?.timeFrame
            ? [
                project.timeFrame.start ? dayjs(project.timeFrame.start) : null,
                project.timeFrame.end ? dayjs(project.timeFrame.end) : null,
              ]
            : null,
        }}
        requiredMark={false}
        layout="vertical"
        onFinish={() => {
          const values = form.getFieldsValue();

          // Convert timeFrame (array of two dates) into an object with start and end.
          let formattedTimeFrame = null;
          if (values.timeFrame && values.timeFrame.length === 2) {
            const [start, end] = values.timeFrame;
            formattedTimeFrame = {
              start: start ? start.toISOString() : null,
              end: end ? end.toISOString() : null,
            };
          }

          const formattedValues = {
            ...values,
            timeFrame: formattedTimeFrame,
          };

          (project ? updateProject : addProject)(formattedValues).then(onClose);
        }}
      >
        <Form.Item
          label="Project Name"
          name="name"
          rules={[{ required: true, message: "Please input project name." }]}
        >
          <Input placeholder="Insert the project name" />
        </Form.Item>
        <Flex gap={16}>
          <Form.Item
            label="Goal Time Frame"
            name="timeFrame"
            rules={[
              { required: true, message: "Please select the goal time frame." },
            ]}
            style={{ flex: 1 }}
          >
            <RangePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Goal Leads"
            name="leads"
            rules={[
              { required: true, message: "Please input the goal leads." },
            ]}
            style={{ flex: 1 }}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              placeholder="Insert a number"
            />
          </Form.Item>
        </Flex>
      </Form>
    </Modal>
  );
}

export default UpsertProjectModal;
