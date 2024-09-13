import { AppDispatch } from "../store/store"; // Adjust the import based on your file structure
import { logout } from "../store/slices/userSlice"; // Import your logout action

const FetchApiWrapper = async (
  url: string,
  options: RequestInit = {},
  dispatch: AppDispatch
) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    console.log("data in fetchApiWrapper.ts", data);

    if (!response.ok) {
      if (
        data.message == "No token provided" ||
        data.message == "Token verification failed"
      ) {
        dispatch(logout());
      }
    }

    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

export default FetchApiWrapper;
