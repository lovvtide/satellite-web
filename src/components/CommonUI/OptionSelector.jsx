import React, { PureComponent } from 'react';


export default class OptionSelector extends PureComponent {

	state = { hover: null };

	render = () => {

		this._props = {
			items: [],
			buttonType: 'checkbox',
			fontFamily: 'JetBrains-Mono-Regular',
			...this.props
		};

		return (
			<div style={styles.container(this._props)}>
				{this._props.items.map(item => {
					return (
						<div
							key={item.key}
							style={{ display: 'flex', marginBottom: 8, cursor: 'pointer' }}
							onClick={() => this.props.onSelect(item.key, !item.selected)}
						>
							<input
								style={{ marginRight: 6, cursor: 'pointer' }}
								checked={item.selected}
								disabled={item.disabled}
								type={this._props.buttonType}
								readOnly
							/>
							<div>
								{item.label} — <span style={{ opacity: 0.54, fontStyle: 'italic' }}>{item.description}</span>
							</div>
						</div>
					);
				})}
			</div>
		);
	};
}

const styles = {

	container: (p) => {

		return {
			...(p.style || {})
		};
	}
};
