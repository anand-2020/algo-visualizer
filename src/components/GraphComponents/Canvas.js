import { v4 as uuidv4 } from "uuid";
import React from "react";
import Edge from "./Edge";
import Vertex from "./Vertex";
import DfsVisulization from "../../algorithms/DFS/DfsVisulization";

class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.vertexIDs = [];
    this.edgeRefs = new Map();
    this.vertexRefs = new Map();
    this.adjList = new Map();
    this.state = {
      visualize: false,
      noOfVertices: 0,
      vertices: [],
      edges: [],
    };
  }

  moveEdge = (vertexID, x, y) => {
    var i;
    for (i = 0; i < this.adjList.get(vertexID).length; i++) {
      const id = this.adjList.get(vertexID)[i];
      this.edgeRefs.get(id).current.changePosition(vertexID, x, y);
    }
  };

  addVertex = () => {
    var newVertices = this.state.vertices.map((vertex) => vertex);
    const newVertexRef = React.createRef();
    const uniqueID = uuidv4();
    newVertices.push(
      <Vertex
        ref={newVertexRef}
        vertexIndex={this.state.noOfVertices}
        moveIncidentEdges={this.moveEdge}
        uniqueID={uniqueID}
        key={uniqueID}
      />
    );

    this.vertexIDs.push(uniqueID);
    this.vertexRefs.set(uniqueID, newVertexRef);
    this.adjList.set(uniqueID, []);

    this.setState({
      vertices: newVertices,
      noOfVertices: this.state.noOfVertices + 1,
    });
  };

  addEdge = (n1, n2) => {
    const newEdgeRef = React.createRef();
    const uniqueID = uuidv4();
    var newEdges = this.state.edges.map((edge) => edge);

    const n1ID = this.vertexIDs[n1];
    const n2ID = this.vertexIDs[n2];

    newEdges.push(
      <Edge
        ref={newEdgeRef}
        key={uniqueID}
        n1Ref={this.vertexRefs.get(n1ID)}
        n2Ref={this.vertexRefs.get(n2ID)}
      />
    );

    this.edgeRefs.set(uniqueID, newEdgeRef);

    this.adjList.get(n1ID).push(uniqueID);
    this.adjList.get(n2ID).push(uniqueID);

    this.setState({
      edges: newEdges,
    });
  };

  clearCanvas = () => {
    this.vertexIDs = [];
    this.edgeRefs = new Map();
    this.vertexRefs = new Map();
    this.adjList = new Map();
    this.setState({
      visualize: false,
      noOfVertices: 0,
      vertices: [],
      edges: [],
    });
  };

  // check for optimisation
  deleteVertex = (vertexIndex) => {
    const uniqueID = this.vertexIDs[vertexIndex];
    this.vertexRefs.delete(uniqueID);

    const incidentEdges = this.adjList.get(uniqueID);
    var i;
    for (i = 0; i < incidentEdges.length; i++) {
      const edgeID = incidentEdges[i];
      const edgeRef = this.edgeRefs.get(edgeID);
      this.edgeRefs.delete(incidentEdges[i]);
      const connectedVertexID = edgeRef.current.getOtherVertexID(uniqueID);

      const updatedNeighbour = this.adjList
        .get(connectedVertexID)
        .filter((id) => id !== edgeID);

      this.adjList.set(connectedVertexID, updatedNeighbour);
    }

    this.vertexIDs.splice(vertexIndex, 1);
    this.adjList.delete(uniqueID);

    for (i = vertexIndex; i < this.state.noOfVertices - 1; i++) {
      const ind = this.vertexRefs.get(this.vertexIDs[i]).current.state
        .vertexIndex;
      if (ind > vertexIndex) {
        this.vertexRefs
          .get(this.vertexIDs[i])
          .current.changeVertexIndex(ind - 1);
      }
    }

    this.setState({
      noOfVertices: this.state.noOfVertices - 1,
      vertices: this.state.vertices.filter(
        (vertex) => vertex.props.uniqueID !== uniqueID
      ),
      edges: this.state.edges.filter(
        (edge) =>
          edge.props.n1Ref.current.id !== uniqueID &&
          edge.props.n2Ref.current.id !== uniqueID
      ),
    });
  };

  // add code for getting starting vertex as input
  startVisualizing = () => {
    this.setState({ visualize: true });
  };

  reset = () => {
    this.vertexRefs.forEach((ref) => ref.current.changeBackgroundColor("aqua"));
    this.edgeRefs.forEach((ref) => ref.current.changeBackgroundColor("aqua"));
    this.setState({ visualize: false });
  };

  render() {
    return (
      <div className="graph">
        {this.state.vertices}
        {this.state.edges}
        {this.state.visualize ? (
          <DfsVisulization
            startingVertex={0}
            noOfVertices={this.state.noOfVertices}
            vertexIDs={this.vertexIDs}
            vertexRefs={this.vertexRefs}
            edgeRefs={this.edgeRefs}
            adjList={this.adjList}
          />
        ) : null}
      </div>
    );
  }
}

export default Canvas;
