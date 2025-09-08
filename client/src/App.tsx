import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/auth";
import { queryClient } from "./queryClient";
import { RouterProvider } from "./router.provider";
import { theme } from "./theme";

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme}>
          <Notifications autoClose={5000} />
          <RouterProvider />
        </MantineProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
