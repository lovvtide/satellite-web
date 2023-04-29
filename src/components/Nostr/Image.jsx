import React, { PureComponent } from 'react';


class Image extends PureComponent {

	state = { error: false };

	render = () => {

		const { src, style } = this.props;
		const { error } = this.state;
		
		return src && !error ? (
			<img
				onMouseOver={this.props.onMouseOver}
				onMouseOut={this.props.onMouseOut}
				id={this.props.id}
				onError={() => this.setState({ error: true })}
				style={style}
				src={src}
			/>
		) : (
			<div
				id={this.props.id}
				style={style}
			/>
		);
	};
}

export default Image;
