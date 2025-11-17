//Function to fomat list to be used in react-select dropdown

export const FormatList = (list) => {
  const formatedList = list.map((data) => ({
    value: data._id,
    label: data.name,
  }));

  return formatedList;
};

//Function to get subjects
export const getSubjects = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/subjects/`);
    const data = await res.json();

    if (!res.ok) {
      return {
        status: "error",
      };
    }
    return {
      status: "success",
      subjects: data,
    };
  } catch (err) {
    return {
      status: "error",
    };
  }
};

//Function to get topics from backend

export const getTopics = async (subjectId) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/topics?subjectId=${subjectId}`
    );
    const data = await res.json();

    if (!res.ok) {
      return {
        status: "error",
      };
    }
    return {
      status: "success",
      topics: data,
    };
  } catch (err) {
    return {
      status: "error",
    };
  }
};

export const getAuth = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/me/role`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (res.status === 401) {
      return {
        role: "unauthorized",
      };
    }
    const data = await res.json();

    if (!res.ok) {
      return {
        role: "unauthorized",
      };
    }

    return {
      role: data?.role,
    };
  } catch (error) {
    return {
      role: "unauthorized",
    };
  }
};

export const checkUnreadNotifications = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications/hasUnread`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (response.status === 401) {
      return {
        status: "unauthorized",
      };
    }
    if (!response.ok) {
      return {
        status: "error",
      };
    }
    return {
      status: "success",
      hasUnread: data.hasUnread,
    };
  } catch (error) {
    return {
      status: "error",
    };
  }
};
