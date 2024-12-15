import {
  Button,
  Card,
  Divider,
  Dropdown,
  Flex,
  Progress,
  Spin,
  Table,
  Tag,
  theme,
  Typography,
} from "antd";
import React from "react";
import {
  PiCalendarFill,
  PiCaretDownBold,
  PiPencil,
  PiPlusBold,
  PiShareBold,
  PiShareNetwork,
  PiShareNetworkFill,
  PiStarFill,
  PiTrash,
} from "react-icons/pi";
import { useApi } from "../providers/Api";
import UpsertProjectModal from "../components/UpsertProjectModal";
import DeleteModal from "../components/DeleteModal";
import UpsertLeadModal from "../components/UpsertLeadModal";
import dayjs from "dayjs";

function Project() {
  const { project, deleteProject, localID, projectID, leads, isSecret } =
    useApi();
  const { colorBgContainer, colorError } = theme.useToken().token;

  const [isProjectModalOpen, setIsProjectModalOpen] = React.useState(false);
  const [deletionMode, setDeletionMode] = React.useState(null);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = React.useState(false);
  const [leadToBeEdited, setLeadToBeEdited] = React.useState(null);

  // Compute timeframe-related values
  const startDate = project?.timeFrame?.start
    ? dayjs(project.timeFrame.start)
    : null;
  const endDate = project?.timeFrame?.end ? dayjs(project.timeFrame.end) : null;

  let daysLeft = null;
  let percentOfTimeElapsed = 0;

  if (startDate && endDate && startDate.isValid() && endDate.isValid()) {
    const totalDays = endDate.diff(startDate, "days");
    const daysPassed = dayjs().diff(startDate, "days");
    daysLeft = endDate.diff(dayjs(), "days");

    // Ensure totalDays > 0 before computing percentage
    if (totalDays > 0) {
      // Clamp daysPassed at least to 0 for a cleaner look if we're before the start date
      const clampedDaysPassed = Math.max(daysPassed, 0);
      percentOfTimeElapsed = (clampedDaysPassed / totalDays) * 100;
      // Clamp percentage between 0 and 100
      percentOfTimeElapsed = Math.min(Math.max(percentOfTimeElapsed, 0), 100);
    }
  }

  return (
    <Flex
      vertical
      justify="center"
      align="center"
      style={{ height: "100vh" }}
      gap={16}
    >
      {/* Create or Edit Project */}
      {localID && !project ? (
        <Spin />
      ) : (
        <UpsertProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
        />
      )}

      {/* Create or Edit Lead */}
      <UpsertLeadModal
        lead={leadToBeEdited}
        isOpen={isAddLeadModalOpen}
        onClose={() => {
          setIsAddLeadModalOpen(false);
          setLeadToBeEdited(null);
        }}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deletionMode}
        name={deletionMode?.name}
        onOk={() => {
          switch (deletionMode.name) {
            case "project":
              deleteProject();
              break;
            default:
              break;
          }
        }}
        onClose={() => setDeletionMode(undefined)}
      />

      {project && (
        <Card
          style={{
            backgroundColor: colorBgContainer + "44",
            width: "50vw",
            maxWidth: 800,
            textAlign: "center",
          }}
        >
          <Flex align="center" justify="space-between">
            <Typography.Title level={3} style={{ margin: 0 }}>
              {project.name}
            </Typography.Title>
            {isSecret && (
              <Dropdown
                trigger={["click"]}
                menu={{
                  items: [
                    {
                      key: "1",
                      label: "Edit",
                      icon: <PiPencil size={18} />,
                      onClick: () => setIsProjectModalOpen(true),
                    },
                    {
                      key: "2",
                      label: (
                        <Typography.Text type="danger">Delete</Typography.Text>
                      ),
                      icon: <PiTrash size={18} color={colorError} />,
                      onClick: () =>
                        setDeletionMode({
                          name: "project",
                          id: project.id,
                        }),
                    },
                  ],
                }}
              >
                <Button icon={<PiCaretDownBold size={16} />} />
              </Dropdown>
            )}
          </Flex>
          <Divider />
          <Flex vertical gap={8}>
            {/* Current Leads Progress */}
            <Typography.Text
              style={{ textAlign: "left", margin: 0, marginBottom: -12 }}
              type="secondary"
            >
              Current Leads
            </Typography.Text>
            <Flex align="center" gap={16}>
              <Progress
                size={{
                  height: 20,
                }}
                percent={
                  (leads.filter((l) => l.status === "won").length /
                    project.leads) *
                  100
                }
                showInfo={false}
              />
              <Tag
                color="default"
                bordered={false}
                style={{ width: "30%", marginBottom: 8, padding: 8 }}
              >
                <Flex align="center" justify="center" gap={8}>
                  <PiStarFill size={18} />
                  <Typography.Text>
                    {leads.filter((l) => l.status === "won").length}/
                    {project.leads} leads
                  </Typography.Text>
                </Flex>
              </Tag>
            </Flex>

            {/* Time Frame Progress */}
            <Typography.Text
              style={{ textAlign: "left", margin: 0, marginBottom: -12 }}
              type="secondary"
            >
              Remaining Time
            </Typography.Text>
            <Flex align="center" gap={16}>
              <Progress
                strokeColor="gold"
                size={{
                  height: 20,
                }}
                percent={percentOfTimeElapsed}
                showInfo={false}
              />
              <Tag
                color="default"
                bordered={false}
                style={{ width: "30%", marginBottom: 8, padding: 8 }}
              >
                <Flex align="center" justify="center" gap={8}>
                  <PiCalendarFill size={18} />
                  {daysLeft !== null && daysLeft >= 0 ? (
                    <Typography.Text>
                      {daysLeft} {daysLeft > 2 ? "days" : "day"} left
                    </Typography.Text>
                  ) : (
                    <Typography.Text type="secondary">N/A</Typography.Text>
                  )}
                </Flex>
              </Tag>
            </Flex>
          </Flex>
          <Divider />
          <Table
            rowHoverable
            onRow={(record) => ({
              style: { cursor: "pointer" },
              onClick: () => {
                setLeadToBeEdited(leads.find((l) => l.id === record.key));
                setIsAddLeadModalOpen(true);
              },
            })}
            pagination={false}
            style={{
              marginTop: 32,
              borderRadius: 16,
              overflow: "hidden",
            }}
            scroll={{ y: "30vh" }}
            footer={() => (
              <Flex justify="flex-end" align="center">
                <Button
                  type="primary"
                  icon={<PiPlusBold color={colorBgContainer} />}
                  onClick={() => setIsAddLeadModalOpen(true)}
                >
                  <Typography.Text style={{ color: colorBgContainer }}>
                    <b>Add Lead</b>
                  </Typography.Text>
                </Button>
              </Flex>
            )}
            bordered
            columns={[
              { title: "Name", dataIndex: "name" },
              { title: "Status", dataIndex: "status", width: 150 },
            ]}
            dataSource={leads.map((lead) => ({
              key: lead.id,
              name: lead.name,
              status: (
                <Tag
                  color={
                    {
                      new: "default",
                      contacted: "processing",
                      qualified: "success",
                      lost: "error",
                      won: "gold",
                    }[lead.status]
                  }
                  style={{
                    width: "100%",
                    padding: 8,
                    textAlign: "center",
                  }}
                >
                  {lead.status.toUpperCase()}
                </Tag>
              ),
            }))}
          />
        </Card>
      )}
      <img
        src="/logo.svg"
        alt="leadgoal.io"
        style={{
          width: 150,
          position: "absolute",
          bottom: 0,
          margin: 16,
          left: 0,
        }}
      />
      {project && (
        <Button
          shape="circle"
          type="primary"
          icon={<PiShareNetworkFill size={24} color={colorBgContainer} />}
          onClick={() => {
            const url = window.location.origin + "/" + projectID;
            navigator.clipboard.writeText(url);
          }}
          style={{
            width: 48,
            height: 48,
            position: "absolute",
            bottom: 0,
            right: 0,
            margin: 16,
          }}
        />
      )}
    </Flex>
  );
}

export default Project;
