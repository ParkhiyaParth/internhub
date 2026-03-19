async function page() {

  return (
    <div className="w-full min-h-screen flex flex-col items-center mt-20">
      <div className="bg-gray-50 w-1/2 flex flex-col items-center p-10 rounded-2xl shadow-lg">
        <h2 className="text-4xl font-bold">About Us</h2>
        <div className="mt-10 text-lg">
          <p>
            Welcome to our project! This website is a simple{" "}
            <span className="font-bold">test project</span> created to
            demonstrate basic web development concepts and functionality. Our
            goal is to build a clean, user-friendly platform while learning and
            experimenting with different technologies.
          </p>
          <br />
          <p>
            This project focuses on practicing core skills such as{" "}
            <span className="font-bold">
              design, development, and problem-solving
            </span>
            . Through this work, we aim to improve our understanding of how
            modern websites are built and how different components work
            together.
          </p>
          <br />
          <p>
            Although this is a test project, we strive to maintain good
            structure, clear design, and an enjoyable user experience.
          </p>
          <br />
          <p>
            <span className="font-bold text-xl">Thank you</span> for visiting!
          </p>
        </div>
      </div>
    </div>
  );
}

export default page;
