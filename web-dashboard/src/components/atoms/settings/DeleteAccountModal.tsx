import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "../Button";

const DeleteAccountModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleDelete = async () => {
    onClose(); // Close the modal
    try {
      if (session?.user?.userId) {
        const res = await fetch("api/user", {
          method: "DELETE",
          body: JSON.stringify(session?.user?.userId),
          headers: {
            "content-type": "application/json",
          },
        });

        if (res.ok) {
          router.push("/delete-success"); // Redirect to the success page
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="p-4 bg-DarkNeutral300 rounded-lg shadow-lg w-96">
            <p>Are you sure you want to delete your account?</p>
            <div className="flex mt-4 gap-4">
              <Button label="Yes, Delete" clickHandler={handleDelete} styles="bg-red-500 hover:bg-red-600 text-white" />
              <Button label="No, Cancel" clickHandler={onClose} />
            </div>
            <button className="absolute top-0 right-0 m-2 text-DarkNeutral1100 hover:text-Magenta600" onClick={onClose}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteAccountModal;
