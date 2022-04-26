import { ToastContainer, Toast } from "react-bootstrap";

const ErrorToast = (props: {
  errorMessage: string;
  closeToast: () => void;
  show: boolean;
}) => (
  <ToastContainer className="p-3" position={"middle-center"}>
    <Toast
      show={show}
      bg="warning"
      onClose={props.closeToast}
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

export default ErrorToast;
