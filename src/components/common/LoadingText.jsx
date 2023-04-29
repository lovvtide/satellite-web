import React, { PureComponent } from 'react';


class LoadingText extends PureComponent {

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
		return (
			<div style={{ ...styles.container, ...(this.props.style || {}) }}>
				{typeof this.props.text !== 'undefined' ? (<div style={styles.text}>{this.props.text}</div>) : null}
				<div>
					{('...').split('').map((v, i) => {
						return <span key={i} style={{ color: this.state.count % 4 < i + 1 ? 'transparent' : '#fff' }}>{' ' + v}</span>
					})}
				</div>
			</div>
		);
	};
}

const styles = {
	container: {
		fontFamily: 'JetBrains-Mono-Regular',
		fontSize: 18
	},
	text: {
		textAlign: 'center',
		color: '#fff',
		fontStyle: 'italic',
		fontSize: 12
	}
};

export default LoadingText;
