import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useRequireAuth() {
  const router = useRouter();
  useEffect(() => {
    if (!localStorage.getItem("jkn_user_id")) {
      router.replace("/login");
    }
  }, []);
}
