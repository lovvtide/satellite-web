import React, { PureComponent } from 'react';


export default class NIP05 extends PureComponent {

	state = { hover: false };

	render = () => {

		if (!this.props.value) { return ''; }

		const s = this.props.value.indexOf('_@') === 0 ? this.props.value.slice(2) : this.props.value;

		if (this.props.clickable === false) {

			return (
				<span style={{ color: '#fff', ...(this.props.style || {}) }}>
					{s}
				</span>
			);
		}

		return (
			<a
				target='_blank'
				rel='noopener noreferrer'
				onMouseOver={() => this.setState({ hover: true })}
				onMouseOut={() => this.setState({ hover: false })}
				href={`https://${this.props.value.split('@')[1]}/.well-known/nostr.json?name=${this.props.value.split('@')[0]}`}
				style={{ color: '#fff', textDecoration: this.state.hover ? 'underline' : 'none', ...(this.props.style || {}) }}
			>
				{s}
			</a>
		)
	};

};
