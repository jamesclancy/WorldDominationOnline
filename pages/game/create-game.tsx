import type { GetStaticProps, NextPage } from "next";
import Link from "next/link";
import { Table } from "react-bootstrap";
import { MapDefinition } from "../../data/models/GameState";
import { PersistanceService } from "../../data/services/PersistanceService";
import { Layout } from "../_layout";

interface ICreateGameProps {
  availableMaps: MapDefinition[];
}

const CreateGame: NextPage<ICreateGameProps> = (props: ICreateGameProps) => {
  return (
    <Layout>
      <div className="asd">
        <h2>Create a Game</h2>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Map</th>
            </tr>
          </thead>
          <tbody>
            {props.availableMaps.map((map) => {
              return (
                <tr key={`tr_{map.id}`}>
                  <td>
                    <Link href={`/game/select-territories?mapId=${map.id}`}>
                      <a>
                        {map.name} ({map.id})
                      </a>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps<ICreateGameProps> = async () => {
  const availableMaps = await PersistanceService.getAllPossibleMaps();

  const props: ICreateGameProps = { availableMaps };

  return { props };
};

export default CreateGame;
