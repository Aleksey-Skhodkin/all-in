import { projectApi } from "@shared/api/projects-api";
import { useQuery } from "@tanstack/react-query";
import { Button, Card } from "antd";

export const ProjectsPage = () => {
  const { data, refetch } = useQuery({
    // queryKey: projectApi.baseKey,
    // queryFn: projectApi.getProjects,
    ...projectApi.getProjects(),
    enabled: false,
  });

  return (
    <div>
      <Button
        onClick={() => {
          refetch();
        }}
      >
        fetch projects
      </Button>
      {data?.data.map(({ id, name, status }) => {
        return (
          <Card key={id} variant="borderless" title={name}>
            status: {status}
          </Card>
        );
      })}
    </div>
  );
};
