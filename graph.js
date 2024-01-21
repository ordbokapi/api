import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

/**
 * @typedef {{x: number, y: number, width: number, height: number}} BoundingBox
 * @typedef {{id: string, bbox?: BoundingBox, x?: number, y?: number}} Node
 * @typedef {{source: Node, target: Node}} Link
 * @typedef {{nodes: Node[], links: Link[]}} GraphData
 */

class WordGraph extends HTMLElement {
  /**
   * Creates a new WordGraph element.
   */
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  /**
   * Runs when the element is added to the DOM. Initializes the canvas and
   * loads the data.
   */
  connectedCallback() {
    this.initializeCanvas();
    this.loadDataAndSetupGraph();
    this.initializeResizeListener();
  }

  /**
   * Updates the canvas size when the element is resized.
   */
  initializeResizeListener() {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === this) {
          this.updateCanvasSize(entry);
        }
      }
    });
    resizeObserver.observe(this);
  }

  /**
   * Initializes the canvas element and sets up the drawing context.
   */
  initializeCanvas() {
    this.canvas = document.createElement('canvas');
    this.shadow.appendChild(this.canvas);
    this.context = this.canvas.getContext('2d');
    this.updateCanvasSize();
  }

  /**
   * Updates the size of the canvas based on the current element's dimensions.
   * @param {ResizeObserverEntry | undefined} entry The resize observer entry.
   * If not provided, the element's bounding client rect is used.
   */
  updateCanvasSize(entry) {
    const rect = entry?.contentRect ?? this.getBoundingClientRect();

    this.canvas.width = rect.width;
    this.canvas.height = rect.height;

    // Update the simulation center.
    if (this.simulation) {
      this.simulation.force(
        'center',
        d3.forceCenter(this.canvas.width / 2, this.canvas.height / 2)
      );
    }
  }

  /**
   * Loads data from 'data.json' and sets up the graph.
   */
  loadDataAndSetupGraph() {
    d3.json('graph-data.json').then((data) => {
      this.setupGraph(data);
    });
  }

  /**
   * Sets up the graph using the given data.
   *
   * @param {Object} data The data used to set up the graph.
   */
  setupGraph(data) {
    const { nodes, links } = this.prepareGraphData(data);
    const simulation = this.createSimulation(nodes, links);
    this.simulation = simulation;
    this.addMouseInteraction(simulation, nodes);
    this.handleSimulationUpdates(simulation, nodes, links);
  }

  /**
   * Prepares graph data by transforming the input data into a format suitable
   * for graph visualization.
   * @param {Object} data The input data containing links and nodes.
   * @param {[string, string][]} data.links The links between nodes.
   * @param {string[]} data.nodes The nodes in the graph.
   * @returns {GraphData} The prepared graph data.
   */
  prepareGraphData(data) {
    const links = data.links.map((link) => ({
      source: link[0],
      target: link[1],
    }));
    const nodes = data.nodes.map((node) => ({ id: node }));
    return { nodes, links };
  }

  /**
   * Creates a force simulation for the given nodes and links.
   * @param {Node[]} nodes The array of nodes.
   * @param {Link[]} links The array of links.
   * @returns {Object} The force simulation object.
   */
  createSimulation(nodes, links) {
    return d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((node) => node.id)
          .strength(0.1)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force(
        'center',
        d3.forceCenter(this.canvas.width / 2, this.canvas.height / 2)
      );
  }

  /**
   * Adds mouse interaction, such that nodes are repelled by the mouse cursor.
   * @param {Object} simulation The simulation object.
   * @param {Node[]} nodes The array of nodes.
   */
  addMouseInteraction(simulation, nodes) {
    let mouseX, mouseY;
    this.canvas.addEventListener('mousemove', (event) => {
      const rect = this.canvas.getBoundingClientRect();
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;

      simulation.force('mouse', (alpha) => {
        nodes.forEach((node) => {
          const dx = node.x - mouseX;
          const dy = node.y - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const force = (alpha * 50 * -1) / distance;

          if (distance < 50) {
            node.vx -= force * dx;
            node.vy -= force * dy;
          }
        });
      });

      simulation.alpha(0.1).restart();
    });
  }

  /**
   * Handles simulation updates by updating node positions and drawing the graph.
   * @param {Simulation} simulation The simulation object.
   * @param {Node[]} nodes The array of nodes.
   * @param {Link[]} links The array of links.
   */
  handleSimulationUpdates(simulation, nodes, links) {
    simulation.on('tick', () => {
      this.updateNodePositions(nodes);
      this.drawGraph(nodes, links);
    });

    window.addEventListener('unload', () => simulation.stop());
  }

  /**
   * Updates the positions of the nodes on the canvas, such that they are
   * contained within the canvas.
   * @param {Node[]} nodes The array of nodes.
   */
  updateNodePositions(nodes) {
    const { width, height } = this.canvas;
    nodes.forEach((node) => {
      if (!node.bbox) return;

      node.x = Math.max(
        node.bbox.width / 2,
        Math.min(width - node.bbox.width / 2, node.x)
      );
      node.y = Math.max(
        node.bbox.height / 2,
        Math.min(height - node.bbox.height / 2, node.y)
      );
    });
  }

  /**
   * Draws a graph on the canvas.
   * @param {Node[]} nodes The array of nodes.
   * @param {Link[]} links The array of links.
   */
  drawGraph(nodes, links) {
    this.clearCanvas();
    this.drawLinks(links);
    this.drawNodes(nodes);
  }

  /**
   * Clears the canvas by removing all drawn content.
   */
  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draws links between nodes on the canvas.
   * @param {Link[]} links The array of links.
   */
  drawLinks(links) {
    const ctx = this.context;
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = '#00ffff';
    ctx.beginPath();
    links.forEach((link) => {
      ctx.moveTo(link.source.x, link.source.y);
      ctx.lineTo(link.target.x, link.target.y);
    });
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draws the nodes on the canvas.
   * @param {Node[]} nodes The array of nodes.
   */
  drawNodes(nodes) {
    const ctx = this.context;
    ctx.save();
    ctx.font = '19px Lora';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    nodes.forEach((node) => {
      this.drawNode(ctx, node);
    });

    ctx.restore();
  }

  /**
   * Draws a node on the canvas.
   *
   * @param {CanvasRenderingContext2D} ctx The rendering context of the canvas.
   * @param {Node} node The node to draw.
   */
  drawNode(ctx, node) {
    const textMetrics = ctx.measureText(node.id);
    const textWidth = textMetrics.width;
    const textHeight = parseInt(ctx.font, 10);

    const borderRadius = 15;
    const padding = 5;
    const rectX = node.x - textWidth / 2 - padding;
    const rectY = node.y - textHeight / 2 - padding;
    const rectWidth = textWidth + 2 * padding;
    const rectHeight = textHeight + 2 * padding;

    if (!node.bbox) {
      node.bbox = {
        x: rectX,
        y: rectY,
        width: rectWidth,
        height: rectHeight,
      };
    }

    ctx.fillStyle = '#1b1b1b';
    this.drawRoundedRect(
      ctx,
      rectX,
      rectY,
      rectWidth,
      rectHeight,
      borderRadius
    );
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.fillText(node.id, node.x, node.y);
  }

  /**
   * Draws a rounded rectangle on the canvas.
   *
   * @param {CanvasRenderingContext2D} ctx The rendering context of the canvas.
   * @param {number} x The x-coordinate of the top-left corner of the rectangle.
   * @param {number} y The y-coordinate of the top-left corner of the rectangle.
   * @param {number} width The width of the rectangle.
   * @param {number} height The height of the rectangle.
   * @param {number} radius The radius of the rounded corners.
   */
  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);

    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);

    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);

    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);

    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);

    ctx.closePath();
  }
}

// Register the custom element so that it can be used in HTML.
customElements.define('word-graph', WordGraph);
