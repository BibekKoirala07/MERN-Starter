import { Button } from "@/components/ui/button";
import { AppDispatch, logout, RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";

const Home = () => {
  const dispatch: AppDispatch = useDispatch();

  const handleLogout = async () => {
    await dispatch(logout());
    const response = await fetch("http://localhost:3000/api/auth/logout", {
      credentials: "include",
    });
    const data = await response.json();

    if (response.ok) {
      console.log("Logged out successfully");
    } else {
      console.error("Failed to log out:", data.message);
    }
  };

  // const handleLogout = async () => {
  //   try {

  //   } catch () {

  //   }
  // }

  const user = useSelector((state: RootState) => state.user);
  console.log("user", user);
  return (
    <div className="text-red-400 text-4xl">
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
};

export default Home;
