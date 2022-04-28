import Link from "next/link";
import { Modal, Spinner } from "react-bootstrap";

const GameWonModal = (props: { winner: string }) => {
  return (
    <Modal show={true} backdrop="static" keyboard={false} centered>
      <Modal.Body className="">
        <div className="d-flex justify-content-center align-self-center">
          <Spinner animation="grow" variant="warning" size="sm"></Spinner>
          &nbsp;&nbsp;
          <strong>{props.winner} Won!</strong>
          <p>
            <Link href="/">Go to Home</Link> |{" "}
            <Link href="/game/create-game">Start a New Game</Link>
          </p>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default GameWonModal;
