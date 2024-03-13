import Link from "next/link";

const DeleteSuccessPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="p-10 bg-gray-800 text-DarkNeutral1100 shadow-md w-96 rounded-3xl">
        <h1 className="text-3xl text-purple-50  mb-4 text-center">Account successfully deleted</h1>
        <p className="text-lg font-thin mb-4 text-center">
          Your account has been successfully deleted. We're sorry to see you go!
        </p>
        <p className="text-center">
          If you change your mind, you can always{" "}
          <Link className="italic text-purple-100 hover:text-purple-200" href="/api/auth/signin">
            sign up
          </Link>{" "}
          again.💜
        </p>
      </div>
    </div>
  );
};

export default DeleteSuccessPage;
