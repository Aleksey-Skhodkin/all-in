import { useAuth } from "@app/providers/auth-provider/AuthProvider";
import type { LoginCredentials } from "@shared/api/auth-api";
import { useNavigate } from "@tanstack/react-router";
import { Typography, Form, Divider, Input, Button } from "antd";

const { Title } = Typography;

export const AuthPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const initialValues: LoginCredentials = {
    email: "admin@example.com",
    password: "password123",
  };

  const onFormSubmit = async (values: LoginCredentials) => {
    await login(values);
    navigate({ to: "/" });
  };

  return (
    <div>
      <Title>Sign in</Title>
      <Divider />
      <Form<LoginCredentials>
        name="login-form"
        layout="vertical"
        form={form}
        initialValues={initialValues}
        onFinish={onFormSubmit}
      >
        <Form.Item<LoginCredentials> label="Email" name="email">
          <Input />
        </Form.Item>
        <Form.Item<LoginCredentials> label="Password" name="password">
          <Input.Password />
        </Form.Item>
        <Button onClick={form.submit}>Sign in</Button>
        <Button type="link" onClick={() => navigate({ to: "/register" })}>
          Do not have registration?
        </Button>
      </Form>
    </div>
  );
};
