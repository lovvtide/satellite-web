import React, { PureComponent } from 'react';

import { COLORS } from '../../constants';

class Eclipsing extends PureComponent {

	state = { t: 0, x: 0 };

	constructor(props) {
		super(props);
		this.canvas = React.createRef();
		this.height = props.height;
		this.width = props.height * 3
	}

	circle = ({ context, centerX, centerY, radius }) => {
		context.beginPath();
		context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
		context.fillStyle = '#fff';
		context.fill();
		context.lineWidth = 1;
		context.strokeStyle = '#fff';
		context.stroke();
	};

	shadow = ({ context, centerX, centerY, radius }, x) => {
		context.beginPath();
		context.arc((centerX - (radius * 2)) + x, centerY, radius + 1, 0, 2 * Math.PI, false);
		context.fillStyle = COLORS.primary;
		context.fill();
		context.lineWidth = 1;
		context.strokeStyle = COLORS.primary;
		context.stroke();
	};

	componentDidMount = () => {

		const canvas = this.canvas.current;
		const params = {
			context: canvas.getContext('2d'),
			centerX: this.width / 2,
			centerY: (this.height / 2),
			radius: (this.height / 2) - 2
		};

		this.interval = setInterval(() => {
			const { t, x } = this.state;

			this.circle(params);
			this.shadow(params, x);

			this.setState({
				t: t + (params.radius * 2) / 1000, // 0.5 RPS
				x: t % (params.radius * 5)
			});

		}, this.props.interval || 100);
	};

	componentWillUnmount = () => {
		clearInterval(this.interval);
	};

	render = () => {
		return (
			<div style={this.props.style || null}>
				<canvas
					width={this.width}
					height={this.height}
					ref={this.canvas}
				/>
			</div>
		);
	};
};

export default Eclipsing;
