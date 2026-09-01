import { useAuthContext } from "@app/providers/auth-provider/AuthProvider";
import type { RegisterCredentials } from "@shared/api/auth-api";
import { Typography, Form, Divider, Input, Button, InputNumber } from "antd";

const { Title } = Typography;

export const RegisterPage = () => {
  const { register } = useAuthContext();
  const [form] = Form.useForm();

  const initialValues: RegisterCredentials = {
    email: "",
    password: "",
  };

  const onFormSubmit = (values: RegisterCredentials) => {
    register(values);
  };

  return (
    <div>
      <Title>Register</Title>
      <Divider />
      <Form<RegisterCredentials>
        name="login-form"
        layout="vertical"
        form={form}
        initialValues={initialValues}
        onFinish={onFormSubmit}
      >
        <Form.Item<RegisterCredentials> label="Email" name="email" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item<RegisterCredentials>
          label="Password"
          name="password"
          rules={[{ required: true }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item<RegisterCredentials> label="Firstname" name="firstname">
          <Input />
        </Form.Item>
        <Form.Item<RegisterCredentials> label="Lastname" name="lastname">
          <Input />
        </Form.Item>
        <Form.Item<RegisterCredentials> label="Age" name="age">
          <InputNumber />
        </Form.Item>
        <Button onClick={form.submit}>Register</Button>
      </Form>
    </div>
  );
};
