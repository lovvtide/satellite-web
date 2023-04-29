import React, { PureComponent } from 'react';


class Image extends PureComponent {

	state = { error: false, loaded: false };

	componentDidUpdate = (nextProps) => {

		if (nextProps.src !== this.props.src) {
			this.setState({ error: false, loaded: false });
		}
	};

	handleLoad = (loadState) => {

		this.setState(loadState);

		if (this.props.onLoadState) {

			this.props.onLoadState(loadState);
		}
	};

	render = () => {

		return this.state.error ? (
			<div
				id={this.props.id}
				style={this.props.style || {}}
				onMouseOver={this.props.onMouseOver}
				onMouseLeave={this.props.onMouseOut}
				onClick={this.props.onClick}
			/>
		) : (
			<img
				id={this.props.id}
				src={this.props.src}
				style={{ ...(this.props.style || {}), opacity: this.state.loaded ? 1 : 0, transition: 'opacity 0.2s ease' }}
				onMouseOver={this.props.onMouseOver}
				onMouseLeave={this.props.onMouseOut}
				onClick={this.props.onClick}
				onLoad={() => { this.handleLoad({ loaded: true }) }}
				onError={() => { this.handleLoad({ error: true, loaded: true }); }}
			/>
		);
	};
}

export default Image;
