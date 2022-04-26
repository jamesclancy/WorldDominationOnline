import { Modal, Spinner } from "react-bootstrap";

const LoadingModal = (props: {
  loadingMessage: string;
  toggleSingleScreenPlay: () => void;
}) => {
  return (
    <Modal show={true} backdrop="static" keyboard={false} centered>
      <Modal.Body className="">
        <div className="d-flex justify-content-center align-self-center">
          <Spinner animation="border" variant="warning" size="sm"></Spinner>
          &nbsp;&nbsp;
          <strong>{props.loadingMessage}</strong> or{" "}
          <a onClick={props.toggleSingleScreenPlay}>
            Enable Single Screen Play
          </a>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default LoadingModal;
