import {
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Button,
  Space,
  theme,
  Card,
} from "antd";
import React, { useEffect } from "react";
import { useApi } from "../providers/Api";
import { PlusOutlined } from "@ant-design/icons";
import { PiTrash } from "react-icons/pi";

function UpsertLeadModal({ lead, isOpen, onClose }) {
  const { colorError, colorBgContainer } = theme.useToken().token;
  const { addLead, updateLead, deleteLead, isLoading } = useApi();
  const [form] = Form.useForm();

  // Determine if we are editing an existing lead or creating a new one
  const isEditing = !!lead;

  useEffect(() => {
    form.setFieldsValue(lead);
  }, [lead]);

  const handleDelete = async () => {
    if (!lead || !lead.id) return;

    // Delete lead and close modal on success
    await deleteLead(lead);
    onClose();
  };

  return (
    <Modal
      title={isEditing ? "Edit Lead" : "Create Lead"}
      open={isOpen}
      confirmLoading={isLoading}
      onOk={form.submit}
      onCancel={onClose}
      centered
      footer={
        <Space>
          {isEditing && (
            <Button
              danger
              icon={<PiTrash />}
              onClick={handleDelete}
              loading={isLoading}
            >
              Delete
            </Button>
          )}
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            onClick={form.submit}
            loading={isLoading}
            style={{ color: colorBgContainer }}
          >
            OK
          </Button>
        </Space>
      }
    >
      <Divider />
      <Form
        form={form}
        requiredMark={false}
        layout="vertical"
        onFinish={() =>
          (isEditing ? updateLead : addLead)({
            ...form.getFieldsValue(),
            ...(lead?.id ? { id: lead.id } : {}),
          }).then(onClose)
        }
      >
        <Form.Item
          label="Lead Name"
          name="name"
          rules={[{ required: true, message: "Please input lead name." }]}
        >
          <Input placeholder="Insert the lead name" />
        </Form.Item>

        <Form.Item
          label="Lead Description"
          name="description"
          rules={[
            { required: true, message: "Please input lead description." },
          ]}
        >
          <Input.TextArea placeholder="Insert the lead description" rows={3} />
        </Form.Item>

        <Form.Item
          label="Lead Status"
          name="status"
          rules={[{ required: true, message: "Please input lead status." }]}
        >
          <Select
            placeholder="Select lead status"
            options={[
              { label: "New", value: "new" },
              { label: "Contacted", value: "contacted" },
              { label: "Qualified", value: "qualified" },
              { label: "Lost", value: "lost" },
              { label: "Won", value: "won" },
            ]}
          />
        </Form.Item>

        <Divider orientation="left">Interactions</Divider>
        <Form.List name="interactions">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card
                  style={{ marginBottom: 16 }}
                  key={key}
                  title={"Interaction #" + (name + 1)}
                  extra={
                    <Button
                      type="text"
                      icon={<PiTrash size={18} color={colorError} />}
                      onClick={() => remove(name)}
                    />
                  }
                >
                  <Flex gap={16}>
                    <Form.Item
                      {...restField}
                      label="Contact Method"
                      name={[name, "method"]}
                      style={{ flex: 1 }}
                      rules={[
                        {
                          required: true,
                          message: "Please select a contact method.",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Select contact method"
                        options={[
                          { label: "Email", value: "email" },
                          { label: "X (Twitter)", value: "x" },
                          { label: "Phone", value: "phone" },
                          { label: "LinkedIn", value: "linkedin" },
                          { label: "Reddit", value: "reddit" },
                          { label: "Twitch", value: "twitch" },
                          { label: "Kick", value: "kick" },
                          { label: "Instagram", value: "instagram" },
                          { label: "Discord", value: "discord" },
                          { label: "Other", value: "other" },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Handle"
                      name={[name, "handle"]}
                      style={{ flex: 1 }}
                      rules={[
                        {
                          required: true,
                          message: "Please provide the handle.",
                        },
                      ]}
                    >
                      <Input placeholder="e.g. user@example.com or @username" />
                    </Form.Item>
                  </Flex>
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    {...restField}
                    label="Description"
                    name={[name, "description"]}
                    rules={[
                      {
                        required: true,
                        message: "Please add a description.",
                      },
                    ]}
                  >
                    <Input.TextArea
                      rows={2}
                      placeholder="Brief interaction summary"
                    />
                  </Form.Item>
                </Card>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Interaction
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}

export default UpsertLeadModal;
