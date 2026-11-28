# GNN Design

Goal: predict the delay in days for every port, plant and customer when a disruption hits some ports (node regression).

## Graph

- Nodes: 11 ports, 20 plants, 46 customers (77 in total). Products and carriers are left out to keep the model small.
- Edges: HOSTED_AT (plant to port), ROUTE (port to port), ORDERED_BY (plant to customer), used in both directions.

## Node features

- Node type (port, plant or customer)
- Number of connections
- Real baseline delay: the average Ship Late Day count from the 9,215 orders
- Disruption risk at the node (set at the ports, from the NLP engine or a chosen scenario)

## Target

The delay in days of every node: the real baseline delay plus the extra delay caused by the disruption.

## Model

Three GraphSAGE layers (PyTorch Geometric) and a linear output layer. Three layers let each node see up to three hops away: port, plant, customer.

## Training data

There is no real disruption data yet, so training scenarios are simulated on the real graph: one to three random ports get a risk, and the extra delay halves with every hop from the disrupted port. This rule is an assumption and will be replaced when real disruption data is available.

## Evaluation

Mean absolute error in days on held-out scenarios, compared with a simple guess that only uses the baseline delay.

## Output

Predicted delay and extra delay for every node, saved in Neo4j and in predictions.json for the dashboard overlay.
