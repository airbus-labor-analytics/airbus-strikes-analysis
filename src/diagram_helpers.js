// Helper functions for modern executive graphics
function renderBadge(x, y, w, h, text, bg, border, color, fontSize = 7.5) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}" fill="${bg}" stroke="${border}" stroke-width="1"/>
    <text x="${x + w/2}" y="${y + h/2 + 2.5}" font-size="${fontSize}" font-weight="700" fill="${color}" text-anchor="middle">${text}</text>
  `;
}
