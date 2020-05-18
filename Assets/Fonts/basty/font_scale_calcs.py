
def sprite_to_font():
	print('sprite_to_font')
	initial = (4, 6)
	target = (533, 800)
	scale_perc = 13333
	move = (498, -397)
	print(move)

def cap_to_lower():
	print('cap_to_lower')
	cap_h = 800.0
	cap_px_h = cap_h/6
	low_h = cap_px_h * 5
	low_px_h = low_h / 6

	shift_px = cap_px_h / 2 
	scale_perc = 100 * low_h / cap_h 
	print({
	 "shift_px": shift_px,
	 "scale_perc": scale_perc,	
	})


cap_to_lower()