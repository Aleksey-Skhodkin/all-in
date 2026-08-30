import { API_BASE_URL } from "@shared/config";
import { Divider, Typography } from "antd";
import { useMutation } from "@tanstack/react-query";
import { Button, Form, Input } from "antd";
import axios from "axios";

const { Title } = Typography;

interface UserAuth {
  email: string;
  password: string;
}

export const HomePage = () => {
  const [form] = Form.useForm();

  const initialValues: UserAuth = {
    email: "",
    password: "",
  };

  const mutations = useMutation({
    mutationKey: ["login"],
    mutationFn: async (data: UserAuth) => {
      await axios.post(`${API_BASE_URL}/login`, data);
    },
    onSuccess: () => {
      console.log("success");
    },
    onError: () => {
      console.log("error");
    },
  });

  const onFormSubmit = (values: UserAuth) => {
    mutations.mutate(values);
  };

  return (
    <div
      style={{
        width: "300px",
        inset: "0",
        padding: "0 15px",
      }}
    >
      <Title>Sign in</Title>
      <Divider />
      <Form<UserAuth>
        name="login-form"
        layout="vertical"
        form={form}
        initialValues={initialValues}
        onFinish={onFormSubmit}
      >
        <Form.Item<UserAuth> label="Email" name="email">
          <Input />
        </Form.Item>
        <Form.Item<UserAuth> label="Password" name="password">
          <Input.Password />
        </Form.Item>
        <Button onClick={form.submit}>Sign in</Button>
      </Form>
    </div>
  );
};
