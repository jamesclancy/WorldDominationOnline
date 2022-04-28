import { useState } from "react";
import { ToastContainer, Toast } from "react-bootstrap";

const ErrorToast = (props: { errorMessage: string }) => {
  const [show, setShow] = useState(true);
  return (
    <ToastContainer className="p-3" position={"middle-center"}>
      <Toast
        show={show}
        bg="warning"
        onClose={() => setShow(false)}
        delay={5000}
        autohide
      >
        <Toast.Header>
          <strong className="me-auto">Error Occurred Saving Event</strong>
        </Toast.Header>
        <Toast.Body>{props.errorMessage}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default ErrorToast;
