
// Abstract function for getting canvas context
export const draw = (id, f) => {
	const c = document.getElementById(id);
	if (c) {
		const ctx = c.getContext('2d');
		f(c, ctx)
	}
};

export const drawProgressBars = (torrent) => {
	draw(`${torrent.infoHash}-prog`, (c, ctx) => {
		ctx.lineWidth = 2;
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		const SPACING = 5;
		const n = (ctx.canvas.width - 2) / SPACING;
		const dx = (ctx.canvas.width - 2) / n;
		for (let z = 0; z < n; z++) {
			const x = (z * dx) + 1;
			ctx.strokeStyle = torrent.progress > 0 && torrent.progress >= (z / n) ? 'rgb(110,223,79)' : 'rgba(255,255,255,0.15)';
			ctx.beginPath();
			ctx.moveTo(x, 3);
			ctx.lineTo(x, ctx.canvas.height - 3);
			ctx.stroke();
		}
	});
};

export const drawProgressLinear = (id, { loaded, total }) => {
	draw(id, (c, ctx) => {
		c.width = '100%';
		c.height = 20;
		ctx.beginPath();
		ctx.rect(0, 0, '100%', 20);
		ctx.stroke();
	});
};

export const drawProgressCircular = (id, { loaded, total }) => {
	draw(id, (c, ctx) => {
		const rpi = (loaded / total) * Math.PI;
		c.width = '300';
		c.height = '300';
		ctx.beginPath();
		ctx.arc(150, 150, 149, rpi * 2, rpi * 4);
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#667eea';
		ctx.stroke();
	});
};
