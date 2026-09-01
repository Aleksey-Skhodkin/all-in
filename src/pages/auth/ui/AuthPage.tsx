import { useAuthContext } from "@app/providers/auth-provider/AuthProvider";
import type { LoginCredentials } from "@shared/api/auth-api";
import { Typography, Form, Divider, Input, Button } from "antd";

const { Title } = Typography;

export const AuthPage = () => {
  const { login } = useAuthContext();
  const [form] = Form.useForm();

  const initialValues: LoginCredentials = {
    email: "",
    password: "",
  };

  const onFormSubmit = (values: LoginCredentials) => {
    login(values);
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
      </Form>
    </div>
  );
};
