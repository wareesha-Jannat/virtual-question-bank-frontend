import { formatDistanceToNow, parseISO, format, isValid } from "date-fns";
import { useRouter } from "next/navigation";

import { useDeleteAccountMutation } from "./mutations";
import { useUserData } from "@/app/hooks/useUserData";

export const MyProfile = () => {
  const router = useRouter();
  const deleteAccountMutation = useDeleteAccountMutation();
  //fetchData
  const { data } = useUserData();
  const userData = data?.user || null;

  // Function to format date (MM/DD/YYYY)
  const formatDateTime = (dateInput) => {
    const parsedDate = new Date(dateInput);
    if (!isValid(parsedDate)) {
      return "Invalid date";
    }
    return format(parsedDate, "dd MMM yyyy hh:mm a");
  };

  const handleDeleteAccount = (userId) => {
    deleteAccountMutation.mutate(userId, {
      onSuccess: (data) => {
        if (data.success) {
          toast.success("Account deleted successfully");
          router.push("/");
        }
      },
      onError: (err) => {
        toast.error(err.message || "Something went wrong");
      },
    });
  };

  return (
    <>
      <div className="container-xxl mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card p-4 shadow-sm">
              <div className="text-center">
                <i className="bi bi-person-circle display-1 "></i>
                <h4 className="mb-1">{userData?.name}</h4>
                <p className="text-muted">Role: {userData?.role}</p>
              </div>
              <hr />
              <div className="profile-details text-center">
                <p>
                  <strong>Email:</strong> {userData?.email}
                </p>
                <p>
                  <strong>Age:</strong> {userData?.age || "not entered"}
                </p>
                <p>
                  <strong>Gender:</strong> {userData?.gender || "not entered"}
                </p>
                <p>
                  <strong>Last Login:</strong>{" "}
                  {userData?.lastLogin
                    ? formatDistanceToNow(parseISO(userData.lastLogin), {
                        addSuffix: true,
                      })
                    : "not available"}
                </p>
                <p>
                  <strong>Profile Created:</strong>{" "}
                  {formatDateTime(userData?.createdAt)}
                </p>
                <p>
                  <strong>Profile Updated:</strong>{" "}
                  {formatDateTime(userData?.updatedAt)}
                </p>
                <button
                  onClick={() => handleDeleteAccount(userData?._id)}
                  className="btn btn-danger "
                  disabled={deleteAccountMutation.isPending}
                >
                  <i className="bi bi-trash "></i>{" "}
                  {deleteAccountMutation.isPending ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    "Delete Account"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
