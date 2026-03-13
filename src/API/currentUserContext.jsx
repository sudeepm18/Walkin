/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import DomoApi from "./domoAPI";
import { UserContext } from "./UserContext";

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [email, setEmail] = useState("");
  const [avatarKey, setAvatarKey] = useState("");
  const [customer, setCustomer] = useState("");
  const [host, setHost] = useState("");

  useEffect(() => {
    let isUserFetched = false;

    DomoApi.GetCurrentUser().then((data) => {
      // console.log("User Data",data);
      
      if (!isUserFetched) {
        const userId = data?.userId;
        const displayName = data?.displayName;
        const email = data?.email;
        const avatarKey = data?.avatarKey;
        const customer=data?.customer;
        const host=data?.host;

        setCurrentUser(displayName || "");
        setCurrentUserId(userId || "");
        setEmail(email || "");
        setAvatarKey(avatarKey || "");
        setCustomer(customer || "");
        setHost(host || "");


        isUserFetched = true;
      }
    });

    return () => {
      isUserFetched = true;
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        currentUserId,
        email,
        avatarKey,
        customer,
        host
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
