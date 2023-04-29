import React, { PureComponent } from 'react';

import { COLORS } from '../../constants';


class Phase extends PureComponent {

	constructor (props) {
		super(props);
		this.canvas = React.createRef();
	}

	componentDidMount = () => {

		// Draw the initial phases of the moon
		this._draw = setInterval(() => {
			if (!isNaN(this.props.progress)) {
				clearInterval(this._draw);
				this.handleDraw();
			}
		}, 100);

		// The phases must be redrawn on resize
		window.addEventListener('resize', this.handleDraw);
	};

	componentWillUnmount = () => {

		window.removeEventListener('resize', this.handleDraw);
		clearInterval(this._draw);
	};

	handleDraw = () => {

		const { /*height, width,*/ progress } = this.props;

		const height = this.props.height;
		const width = this.props.width;


		const c = this.canvas.current;

		// Constants
		const RADIUS = (height / 4); // Moon radius
		const LINES = 200; // Number of horizontal lines in each moon
		const LIGHT = '#FFFFFF';
		const DARK = COLORS.secondary;

		const dpi = window.devicePixelRatio;

		// Set context constant values
		c.height = height * dpi;
		c.width = width * dpi;
    c.style.width = width + 'px';
    c.style.height = height + 'px';

		const ctx = c.getContext('2d');

		ctx.scale(dpi, dpi);

		// <-------- waxing --------> || <------- waning ------->
		// [0] [0.25] [0.50] [0.75] [1.0] [0.75] [0.5] [0.25] [0]
		const phases = [ 0, 0.25, 0.5, 0.75, 1, 0.75, 0.5, 0.25, 0 ];
		const dx = width / 9; // Distance between centers
		const dy = (RADIUS * 2) / LINES; // Distance between lines
		const mid = height / 2;

		const ini = 0 + (dx / 2);
		const fin = width - (dx / 2);
		const xdel = (fin - ini);
		const xprog = xdel * progress;

		ctx.lineWidth = 0.5;

		for (let i = 0; i < phases.length; i++) { // Draw each moon

			const waxing = i < 5;
			const phase = phases[i];
			const x0 = (dx * i) + (dx / 2); // Starting x for each moon

			for (let j = (LINES / 2) * -1; j <= LINES / 2; j++) { // Draw each horizontal line
				
				const y = dy * j;
				const _y = y + (height / 2);

				const y2 = Math.pow(y, 2);
				const r2 = Math.pow(RADIUS, 2);
				const x = Math.pow(r2 - y2, 0.5);
				
				const p = (phase * x) * 2;
				const si = waxing ? (x0 + x) : (x0 - x);
				const sm = waxing ? (si - p) : (si + p);
				const sf = waxing ? (x0 - x) : (x0 + x);

				ctx.beginPath();
				ctx.strokeStyle = LIGHT;
				ctx.moveTo(si, _y);
				ctx.lineTo(sm, _y);
				ctx.stroke();

				ctx.beginPath();
				ctx.strokeStyle = DARK;
				ctx.moveTo(sm, _y);
				ctx.lineTo(sf, _y);
				ctx.stroke();
			}
		}

		ctx.lineWidth = 1;

		// Draw axis
		ctx.beginPath();
		ctx.strokeStyle = '#fff';
		ctx.moveTo(ini, mid);
		ctx.lineTo(xprog + (dx / 2), mid);
		ctx.stroke();

		ctx.beginPath();
		ctx.strokeStyle = COLORS.secondary;
		ctx.moveTo(xprog + (dx / 2), mid);
		ctx.lineTo(fin, mid);
		ctx.stroke();
	};

	render = () => { return <canvas ref={this.canvas} />; };
}

export default Phase;
