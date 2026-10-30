import { useNavigate } from "@tanstack/react-router";
import { Button, Flex } from "antd";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <Flex align="center" justify="center" gap={20} style={{ height: "50px" }}>
      <Button
        type="link"
        onClick={() => {
          navigate({ to: "/posts" });
        }}
      >
        Posts
      </Button>
      <Button
        type="link"
        onClick={() => {
          navigate({ to: "/projects" });
        }}
      >
        Projects
      </Button>
    </Flex>
  );
};

export default Navbar;
