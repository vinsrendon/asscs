import { Navigate } from "react-router";
import { useEffect, useState } from "react";
import axios from "../../axios-config";

function RoleGuard({ children, allowedRoles }) {
  const [status, setStatus] = useState("loading");
  const [user, setUser] = useState(null);

//   const location = useLocation();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await axios.get("/verify");

        const userData = res.data.user;        

        setUser(userData);
        setStatus("authenticated");
      } catch (error) {
        console.log(error);
        setStatus("unauthenticated");
      }
    };

    verifyUser();
  }, []);

  // Still checking authentication
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // Not logged in
  if (status === "unauthenticated") {
    return <Navigate to="/" replace />;
  }

  // User doesn't have permission for this route
  if (!allowedRoles.includes(user.role)) {
    return <RoleRedirect role={user.role} />;
  }

  return children;
}


function RoleRedirect({ role }) {  
  switch (role) {
    case "ADMIN":
      return <Navigate to="/admindash" replace />;

    case "TEACHER":
      return <Navigate to="/teacherdash" replace />;

    case "STUDENT":
      return <Navigate to="/studentdash" replace />;

    default:
      return <Navigate to="/" replace />;
  }
}

export default RoleGuard;