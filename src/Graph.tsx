import React, { Component } from 'react';
import { Table, TableData } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  /**
  * Modify the 'componentDidMount' method to update the schema object that configures the Perspective table view.
  * 
  * Changes to the schema include:
  * - Adding a 'ratio' field to track stock ratios, without distinguishing between two stocks.
  * - Adding fields for 'upper_bound', 'lower_bound', and 'trigger_alert' to monitor when bounds are crossed.
  * - Including 'price_abc' and 'price_def' for calculating the ratio, which will not be displayed in the graph.
  * - Adding a 'timestamp' field to track changes over time.
  */

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      price_abc: 'float',
      price_def: 'float',
      ratio: 'float',
      timestamp: 'date',
      upper_bound: 'float',
      lower_bound: 'float',
      trigger_alert: 'float',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);

      /**
      * To configure the graph, modify or add more attributes to the PerspectiveViewerElement.
      *
      * The updated attributes are as follows:
      * - 'view': Set to 'y_line' to visualize the data as a line graph.
      * - 'column-pivots': Removed to focus on ratios between stock ABC and DEF instead of their separate prices.
      * - 'row-pivots': This attribute is crucial for the x-axis, allowing mapping of each data point based on its timestamp.
      * - 'columns': Specify fields to focus on along the y-axis. We want to track 'ratio', 'lower_bound', 'upper_bound', and 'trigger_alert' to reduce noise in the graph.
      * - 'aggregates': Handle duplicate data by consolidating similar data points into one. A data point is considered unique if it has a timestamp; otherwise, average values of non-unique fields (e.g., 'ratio', 'price_abc', etc.).
      */

      elem.setAttribute('view', 'y_line');
      elem.setAttribute('row-pivots', '["timestamp"]');
      elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]');
      elem.setAttribute('aggregates', JSON.stringify({
        price_abc: 'avg',
        price_def: 'avg',
        ratio: 'avg',
        timestamp: 'distinct count',
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg',
      }));
    }
  }

  /**
  * Update the 'componentDidUpdate' method to refresh the graph with new data.
  * Modify the argument for 'this.table.update' to include the latest data.
  */
  componentDidUpdate() {
    if (this.table) {
      this.table.update([
        DataManipulator.generateRow(this.props.data),
      ] as unknown as TableData);
    }
  }
}

export default Graph;
