import { formatDistanceToNow, parseISO, format, isValid } from "date-fns";
import { useRouter } from "next/navigation";

import { useDeleteAccountMutation } from "./mutations";
import { useUserData } from "@/app/hooks/useUserData";
import Loader from "@/app/components/Loader";
import { toast } from "react-toastify";
import styles from "./ProfileComponent.module.css";

export const MyProfile = () => {
  const router = useRouter();
  const deleteAccountMutation = useDeleteAccountMutation();
  //fetchData
  const { data, isLoading } = useUserData();
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
    <section className={styles.profileCard} aria-busy={isLoading}>
      {isLoading ? (
        <div className={styles.loadingState}>
          <Loader />
        </div>
      ) : (
        <>
          <div className={styles.profileIdentity}>
            <span className={styles.avatar} aria-hidden="true">
              <i className="bi bi-person"></i>
            </span>
            <div>
              <h2 className={styles.profileName}>{userData?.name}</h2>
              <span className={styles.roleBadge}>{userData?.role}</span>
            </div>
          </div>

          <dl className={styles.profileDetails}>
            <div className={styles.detailItem}>
              <dt className={styles.detailLabel}>Email</dt>
              <dd className={styles.detailValue}>{userData?.email}</dd>
            </div>
            <div className={styles.detailItem}>
              <dt className={styles.detailLabel}>Age</dt>
              <dd className={styles.detailValue}>
                {userData?.age || "not entered"}
              </dd>
            </div>
            <div className={styles.detailItem}>
              <dt className={styles.detailLabel}>Gender</dt>
              <dd className={styles.detailValue}>
                {userData?.gender || "not entered"}
              </dd>
            </div>
            <div className={styles.detailItem}>
              <dt className={styles.detailLabel}>Last login</dt>
              <dd className={styles.detailValue}>
                {userData?.lastLogin
                  ? formatDistanceToNow(parseISO(userData.lastLogin), {
                      addSuffix: true,
                    })
                  : "not available"}
              </dd>
            </div>
            <div className={styles.detailItem}>
              <dt className={styles.detailLabel}>Profile created</dt>
              <dd className={styles.detailValue}>
                {formatDateTime(userData?.createdAt)}
              </dd>
            </div>
            <div className={styles.detailItem}>
              <dt className={styles.detailLabel}>Profile updated</dt>
              <dd className={styles.detailValue}>
                {formatDateTime(userData?.updatedAt)}
              </dd>
            </div>
          </dl>

          <div className={styles.deleteActions}>
            <button
              type="button"
              onClick={() => handleDeleteAccount(userData?._id)}
              className={styles.dangerButton}
              disabled={deleteAccountMutation.isPending}
            >
              <i className="bi bi-trash" aria-hidden="true"></i>
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
        </>
      )}
    </section>
  );
};
