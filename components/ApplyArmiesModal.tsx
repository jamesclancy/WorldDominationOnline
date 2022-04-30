import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

const ApplyArmiesModal = (props: {
  possibleArmiesToApply: number;
  potentialActions: string;
  clearDetail: () => void;
  applyArmies: (armies: number) => void;
}) => {
  useEffect(() => {
    setSelectedArmies(props.possibleArmiesToApply);
  }, [props]);

  let [selectedArmies, setSelectedArmies] = useState(
    props.possibleArmiesToApply
  );

  let Slider = () =>
    props.possibleArmiesToApply === 1 ? (
      <p>Are you sure you want to use your only spare army?</p>
    ) : (
      <>
        <p>Select armies to move.</p>
        <Form.Range
          key="slider"
          min={1}
          max={props.possibleArmiesToApply}
          step={1}
          onChange={(e) => setSelectedArmies(e.target.valueAsNumber)}
          value={selectedArmies}
        />{" "}
        {selectedArmies}
      </>
    );

  return (
    <Modal show centered backdrop="static" keyboard={false} animation={false}>
      <Modal.Header>
        <Modal.Title>Confirm {props.potentialActions}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Slider />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.clearDetail}>Cancel</Button>
        <Button onClick={() => props.applyArmies(selectedArmies)}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ApplyArmiesModal;
