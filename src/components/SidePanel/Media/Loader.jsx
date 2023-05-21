import React, { PureComponent } from 'react';


class Loader extends PureComponent {

	state = { count: 0 };

	componentDidMount = () => {
		this.dotdot = setInterval(() => {
			this.setState({ count: this.state.count + 1 })
		}, 500);
	};

	componentWillUnmount = () => {
		clearInterval(this.dotdot);
	};

	render = () => {
		return ('...').split('').map((v, i) => {
			return <span key={i} style={{ color: this.state.count % 4 < i + 1 ? 'transparent' : '#fff' }}>{' ' + v}</span>
		});
	};

// 	render = () => {
// 		return (
// 			<div style={{ ...styles.container, ...(this.props.style || {}) }}>
// 				{typeof this.props.text !== 'undefined' ? (<div style={styles.text}>{this.props.text}</div>) : null}
// 				<div>
// 					{('...').split('').map((v, i) => {
// 						return <span key={i} style={{ color: this.state.count % 4 < i + 1 ? 'transparent' : '#fff' }}>{' ' + v}</span>
// 					})}
// 				</div>
// 			</div>
// 		);
// 	};
}

export default Loader;

