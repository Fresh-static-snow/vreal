import { routes } from "@/routes";
import { createFileRoute } from "@tanstack/react-router";
import {
  Button,
  Stack,
  Text,
  Title,
  Box,
  TextInput,
  PasswordInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { loginUser, registerUser } from "@/api";
import { router } from "@/router";
import { useAuth } from "@/contexts";
import { AxiosError } from "axios";
import { LocalStorageKeys } from "@/types/";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { ERROR_API_CALL } from "@/constants";

export const Route = createFileRoute(routes.login)({
  component: Login,
});

function Login() {
  const { login } = useAuth();

  const form = useForm({
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length >= 6 ? null : "Password must be at least 6 characters",
    },
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (res) => {
      login(res.data.accessToken);
      router.navigate({ to: routes.root });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        notifications.show({
          title: "Login Error",
          message: err.response?.data?.message || ERROR_API_CALL,
          color: "red",
        });
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (res) => {
      localStorage.setItem(LocalStorageKeys.ACCESS_TOKEN, res.data.accessToken);
      router.navigate({ to: routes.root });
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        notifications.show({
          title: "Registration Error",
          message: err.response?.data?.message || ERROR_API_CALL,
          color: "red",
        });
      }
    },
  });

  const handleGoogleLogin = () => {
    window.location.href = import.meta.env.VITE_GOOGLE_LOGIN_URL;
  };

  return (
    <Box
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <form style={{ width: 400, maxWidth: "90%", zIndex: 1 }}>
        <Stack>
          <Title order={2} ta="center">
            Welcome Back
          </Title>
          <Text size="sm" ta="center">
            Login or register to your account
          </Text>
          <TextInput
            label="Email"
            placeholder="your@email.com"
            {...form.getInputProps("email")}
          />
          <PasswordInput
            label="Password"
            placeholder="your password"
            {...form.getInputProps("password")}
          />

          <Button
            variant="filled"
            color="blue"
            onClick={() => registerMutation.mutate(form.values)}
            loading={registerMutation.isPending}
          >
            Register
          </Button>
          <Button
            variant="outline"
            color="gray"
            onClick={() => loginMutation.mutate(form.values)}
            loading={loginMutation.isPending}
          >
            Login
          </Button>
          <Button variant="outline" color="red" onClick={handleGoogleLogin}>
            Login with Google
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
