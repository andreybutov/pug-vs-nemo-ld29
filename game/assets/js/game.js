/*

Ludum Dare 29

'Pug vs. Nemo'

*/


window.onload = function() 
{
	var width = 800;
	var height = 600;
    

    var game = new Phaser.Game(
    	width, 
    	height, 
    	Phaser.AUTO, 
    	'game', 
    	{ preload: preload, create: create, update: update }
    );


    var states = 
    {
    	'intro' 	 : 0,
    	'game'  	 : 1,
    	'boss_intro' : 2,
    	'boss'  	 : 3,
    	'game_over'	 : 4,
    	'victory'	 : 5
    }

    
    var state = states.intro;


	var sky;
	var water;    
    var nautilus;
    var dock_back_layer;
    var dock_front_layer;
    var pug;
    var bottom;
    var pugIntro = false;
    var pug_pos = 0;
    var depth = 2000;
    var dive_speed = 10;
    var depthtext;
    var airtext;
    var nautilusHealthText;
    var air = "100";
    var air_loss_rate = 0.04;
    var alive = true;
    var victory = false;
    var gameovertext;
    var victorytext;
    var stahp;
    var exhaledBubbles = [];
    var newBubbles = [];
    var bomb;
    var bombVelocity;
    var bombDamage = 20;
    var bombTargetX;
    var bombTargetY;
    
    var instructions;

    var bossIntroPhase = 0;

    var pugPunched = false;

    var leftWall = [];
    var rightWall = [];

    var walkAnimation;
    var fightAnimation;
    var punchAnimationPlaying = false;


    
    function preload() 
    {
    	game.antialias = false;

    	game.load.image('sky', 'assets/images/sky.png');
    	game.load.image('water', 'assets/images/water2.jpg');
    	game.load.image('nautilus', 'assets/images/nautilus.png');
    	game.load.image('dock_back_layer', 'assets/images/dock_back_layer.png');
    	game.load.image('dock_front_layer', 'assets/images/dock_front_layer.png');
    	game.load.image('stahp', 'assets/images/stahp.png');
    	game.load.image('bubble', 'assets/images/bubble.png');
    	game.load.image('oldbubble', 'assets/images/oldbubble.png');
    	game.load.image('bomb', 'assets/images/bomb.png');
    	game.load.image('instructions', 'assets/images/instructions.png');
    	game.load.image('leftwall', 'assets/images/leftwall3.png');
    	game.load.image('rightwall', 'assets/images/rightwall3.png');
 		
 		game.load.spritesheet('pug', 'assets/images/pug.png', 64, 64);

    	game.load.image('bottom', 'assets/images/bottom3.png');
    	
    	game.load.bitmapFont('font', 'assets/fonts/font.png', 'assets/fonts/font.fnt');
    }

    

    function create() 
    {
    	game.physics.startSystem(Phaser.Physics.ARCADE);
    	game.physics.arcade.gravity.y = 0;

    	sky = game.add.sprite(0, 0, 'sky');
    	water = game.add.sprite(0, 400, 'water');
    	
    	nautilus = game.add.sprite(300, 380, 'nautilus');

    	dock_back_layer = game.add.sprite(0, 300, 'dock_back_layer');
    	
    	pug = game.add.sprite(0, 294, 'pug');
    	walkAnimation = pug.animations.add('walk', [0,1,2,3,4,5,6,7]);

    	// walkAnimation.onStart.add(function(){
    	// }, this);

    	// walkAnimation.onLoop.add(function() {
    	// }, this);

    	// walkAnimation.onComplete.add(function() {
    	// }, this);

    	fightAnimation = pug.animations.add('fight', [0,4,5,4,0])
    	// fightAnimation.onStart.add(function(){
    	// }, this);
    	fightAnimation.onLoop.add(function() {
    		pug.animations.stop('fight', true);
    		pug.animations.play('walk', 7, true);
    	}, this);
    	// fightAnimation.onComplete.add(function() {
    	// }, this);

		leftWall[0] = game.add.sprite(0, 0, 'leftwall');
		leftWall[1] = game.add.sprite(0, height, 'leftwall');

		rightWall[0] = game.add.sprite(width - 42, 0, 'rightwall');
		rightWall[1] = game.add.sprite(width - 42, height, 'rightwall');

		leftWall[0].visible = leftWall[1].visible = rightWall[0].visible = rightWall[1].visible = false;
    	
    	game.physics.enable(pug, Phaser.Physics.ARCADE);

    	dock_front_layer = game.add.sprite(60, 300, 'dock_front_layer');
    	depthtext = game.add.bitmapText(width - 250, 20, 'font','', 32);
    	airtext = game.add.bitmapText(width - 250, 60, 'font', '', 32);

		bomb = game.add.sprite(nautilus.x + 10, nautilus.y + (nautilus.height / 2), 'bomb');
		game.physics.enable(bomb, Phaser.Physics.ARCADE);
		bomb.anchor.setTo(0.5, 0.5);
		bomb.body.collideWorldBounds = false;
		bomb.body.bounce.setTo(0.9, 0.9);
		bomb.body.moves = true;
		bomb.body.allowGravity = false;
		bomb.exists = false;    	

    	bottom = game.add.sprite(0, height, 'bottom');
		
		game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.add(function() 
		{
			if ( state == states.game || state == states.boss ) {
				pugPunched = true;
			}
		}, this);
    }


    
    function update()
    {
    	switch ( state )
    	{
    		case states.intro: 		tick_intro(); 		 break;
    		case states.game: 		tick_game(); 		 break;
    		case states.boss_intro: tick_boss_intro(); 	 break;
    		case states.boss: 		tick_boss(); 		 break;
    		case states.game_over:  tick_game_over();	 break;
    		case states.victory: 	tick_victory(); break;
    		
    		default: console.log("ERROR: unknown game state: " + state);
    	}
    }



    function tick_intro() 
    {
    	nautilus.x += 1;
    	nautilus.y += 2;

    	if ( nautilus.x > width || nautilus.y > height ) 
    	{
    		nautilus.kill();
    	}

    	if ( !pugIntro ) 
    	{
    		pugIntro = true;

			 // to end of dock
			pug.animations.play('walk', 15, true);
			var pugToEndOfDock = game.add.tween(pug).to({x:240}, 1000).start();
			pugToEndOfDock.onComplete.addOnce(function()
			{
				pug.animations.stop('walk', true);
				instructions = game.add.sprite(320, 50, 'instructions');
			});

			game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).onDown.addOnce(function() {

	    		instructions.destroy();

				stahp = game.add.sprite(315, 160, 'stahp');

				// into the air
				var pugJumpOut = game.add.tween(pug).to( { x:400, y:200 }, 250, Phaser.Easing.Linear.None, true, 1500 ).start();

				pugJumpOut.onStart.addOnce(function() {
					stahp.destroy();
				});

				pugJumpOut.onComplete.addOnce(function()
				{
					// into the water
					var pugJumpOut = game.add.tween(pug).to( {y:400}, 500 ).start();
					var backDockAway = game.add.tween(dock_back_layer).to( {x:-dock_back_layer.width - 10, y:0}, 500 ).start();
					var frontDockAway = game.add.tween(dock_front_layer).to({x:-dock_front_layer.width - 10, y:0}, 500).start();
					var waterFill = game.add.tween(water).to({y:0}, 750).start();

					leftWall[0].visible = rightWall[0].visible = true;
					
					leftWall[0].y = height;
					game.add.tween(leftWall[0]).to({y:0}, 1000).start();

					rightWall[0].y = height;
					game.add.tween(rightWall[0]).to({y:0}, 1000).start();

					waterFill.onComplete.addOnce(function()
					{
						pug.animations.play('walk', 7, true);


						var pugStartPosition = game.add.tween(pug).to({y:200}, 1000).start();
						pugStartPosition.onComplete.addOnce(function()
						{
							leftWall[1].visible = rightWall[1].visible = true;
							
							state = states.game;
						});
					});
				});
			}, this);
    	}
    }



    function tick_game() 
    {
    	reduceAirWithTime();

     	if ( alive ) 
     	{
		    var screenVerticalMovement = movePug(true);

		    processExhaledBubbles(screenVerticalMovement);

		    processNewBubbles(screenVerticalMovement);

		    if ( bottom.y < height )
		    {
	    		depthtext.visible = false;
	    		bomb.exists = false;
		    	state = states.boss_intro;
		    	return;
		    }
		}
		else  // dead
		{
			state = states.game_over;
			return;
		}

		if ( !bomb.exists && game.rnd.integerInRange(0, 5) == 0 )
		{
			bomb.exists = true;
			bomb.x = game.rnd.integerInRange(width - 100, width + 10);
			bomb.y = height;
			bombVelocity = game.rnd.integerInRange(1, 2);
			bomb.body.velocity.setTo( (pug.x - bomb.x) * bombVelocity, (pug.y - bomb.y) * bombVelocity );
		}

		if ( bomb.exists )
		{
			if ( bomb.x < -40 || bomb.x > width + 40 || bomb.y < -40 || bomb.y > height + 40 )
			{
				bomb.exists = false;
			}
			else
			{
				if (  intersects(bomb, pug) )
				{
					air -= bombDamage;
					bomb.exists = false;
					checkDeath();
				}
				else if ( pugPunched && closeEnoughToPunch(pug, bomb) )
				{
					var existingVelocity = bomb.body.velocity;
					bomb.body.velocity.setTo(-existingVelocity.x, -existingVelocity.y);
				}
			}
		}

	    depthtext.setText("Depth: " + pug_pos);

		playPunchAnimationIfNeeded();
		    
	    updateRemainingAirDisplay();
    }



    function tick_boss()
    {
    	reduceAirWithTime();

		if ( alive )
		{
			movePug(false);

			processExhaledBubbles();

			processNewBubbles();
		}
		else
		{
			state = states.game_over;
			return;
		}

		if ( victory )
		{
			state = states.victory;
			return;
		}
    	
    	if ( !bomb.exists ) 
    	{
    		bomb.exists = true;
			bomb.x = nautilus.x + 10;
			bomb.y = nautilus.y + (nautilus.height / 2);
    		bombVelocity = game.rnd.integerInRange(1, 1);
    		bomb.body.velocity.setTo((pug.x - bomb.x) * bombVelocity, (pug.y - bomb.y) * bombVelocity);
    	}

		if ( bomb.x < -40 || bomb.x > width + 40 || bomb.y < -40 || bomb.y > height + 40 ) 
		{
			bomb.exists = false;
		}
		else
		{
			if ( intersects(bomb, pug) )
			{
				air -= bombDamage;
				bomb.exists = false;
				checkDeath();
			}
			else if ( bomb.returning && intersects(bomb, nautilus) )
			{
				bomb.returning = false;
				bomb.exists = false;

				nautilus.health -= bombDamage;
				if ( nautilus.health < 0 ) {
					nautilus.health = 0;
				}

				checkVictory();
			}
			else if ( pugPunched && closeEnoughToPunch(pug, bomb) )
			{
				bomb.returning = true;
				var existingVelocity = bomb.body.velocity;
				bomb.body.velocity.setTo(-existingVelocity.x, -existingVelocity.y);
			}
		}

		playPunchAnimationIfNeeded();

		nautilusHealthText.setText("Nautilus: " + nautilus.health + "%");
	    updateRemainingAirDisplay();
    }



    function tick_boss_intro()
    {
    	if ( bossIntroPhase == 0 )
    	{
    		bossIntroPhase = 1;
    		
    		nautilus.revive();
			nautilus.health = 100;

	    	nautilus.x = width;
	    	nautilus.y = height - 300;
	    	var nautilusEnters = game.add.tween(nautilus).to( { x : (width - 300) }, 4000 ).start();
	    	nautilusEnters.onComplete.addOnce ( function() { bossIntroPhase++; } );

	    	var bottomEnters = game.add.tween(bottom).to( { y : height - bottom.height}, 500 ).start();
	    	bottomEnters.onComplete.addOnce ( function() { bossIntroPhase++; } );

	    	var pugIntoPosition = game.add.tween(pug).to( { x : 20, y : height / 2 }, 2000 ).start();
	    	pugIntoPosition.onComplete.addOnce ( function() { bossIntroPhase++; } );

	    	nautilusHealthText = game.add.bitmapText(airtext.x, airtext.y, 'font', "Nautilus: " + nautilus.health + "%", 32);
	    	nautilusHealthText.alpha = 0;

	    	var airStatusIntoPosition = game.add.tween(airtext).to({ x: depthtext.x, y: depthtext.y }, 2000).start();
	    	airStatusIntoPosition.onComplete.addOnce(function() { bossIntroPhase++; });

	    	var nautilusHealthTextAppears = game.add.tween(nautilusHealthText).to({alpha:1}, 2000).start();
	    	nautilusHealthTextAppears.onComplete.addOnce(function() { bossIntroPhase++; });
    	}

    	if ( bossIntroPhase == 5 )
    	{
    		state = states.boss;
    	}
    }



    function tick_game_over()
    {
		if ( !gameovertext ) 
		{
			pug.animations.stop('walk', true);
			gameovertext = game.add.bitmapText((width / 2) - 120, (height / 2) - 32, 'font', 'Game Over!', 64);
		}
    }



    function tick_victory()
    {
		if ( !victorytext ) 
		{
			pug.animations.stop('walk', true);
			victorytext = game.add.bitmapText((width / 2) - 120, (height / 2) - 32, 'font', 'You Won!', 64);
		}
    }



    function movePug ( allowScreenToFollow )
    {
    	var screenVerticalMovement = 0;

    	pug.angle = 0;

		if ( game.input.keyboard.isDown(Phaser.Keyboard.LEFT) )
	    {
	    	if ( pug.x >= 0 ) {
	    		pug.x -= dive_speed;
	    	}
	    }
	    else if ( game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) )
	    {
	    	if ( pug.x < width - pug.width ) {
	    		pug.x += dive_speed;
	    	}
	    }

	    if ( game.input.keyboard.isDown(Phaser.Keyboard.UP) )
	    {
	    	pug.angle = -20;

	    	if ( allowScreenToFollow )
	    	{
		    	if ( pug.y > 100 )
		    	{
		    		pug.y -= dive_speed;
		    	}

		    	if ( pug.y <= 100 && pug_pos > 0 ) 
		    	{
		    		pug_pos -= dive_speed;

		    		screenVerticalMovement = -dive_speed;

		    		if ( pug_pos < 0 ) pug_pos = 0;
		    		if ( bottom.y < height ) bottom.y += dive_speed;
		    	}
		    }
		    else
		    {
		    	if ( pug.y > 0 ) {
		    		pug.y -= dive_speed;
		    	}
		    }
		}
	    else if ( game.input.keyboard.isDown(Phaser.Keyboard.DOWN) )
	    {
	    	pug.angle = 20;

	    	if ( allowScreenToFollow )
	    	{
		    	if ( pug.y < height - 200 ) {
		    		pug.y += dive_speed;
		    	}

		    	if ( pug.y >= height - 200 ) 
		    	{
		    		if ( pug_pos < depth - 100 ) 
		    		{
		    			pug_pos += dive_speed;

		    			screenVerticalMovement = dive_speed;
		    			
		    			if ( pug_pos > depth - 200 ) 
		    			{
							if ( bottom.y > height - 100 ) {
								bottom.y -= dive_speed;
							}	    				
		    			}
		    		}
		    	}
	    	}
	    	else
	    	{
	    		if ( pug.y + pug.height < height ) {
	    			pug.y += dive_speed;
	    		}
	    	}
	    }


	    leftWall[0].y -= screenVerticalMovement;
	    rightWall[0].y -= screenVerticalMovement;

	    leftWall[1].y = leftWall[0].y + leftWall[0].height;
	    rightWall[1].y = rightWall[0].y + rightWall[0].height;

	    if ( leftWall[1].y == 0 )
	    {
	    	var tmp = leftWall[0];
	    	leftWall[0] = leftWall[1];
	    	leftWall[1] = tmp;
	    }

	    if ( rightWall[1].y == 0 )
	    {
	    	var tmp = rightWall[0];
	    	rightWall[0] = rightWall[1];
	    	rightWall[1] = tmp;
	    }

	    return screenVerticalMovement;
    }



    function processExhaledBubbles(screenVerticalMovement)
    {
    	screenVerticalMovement = screenVerticalMovement || 0;

	    // new exhaled bubble?
	    if ( game.rnd.integerInRange(0, 100) < 3 ) 
	    {
	    	var bubble = game.add.sprite(
	    		pug.x + pug.width / 2 + (game.rnd.integerInRange(-10, 10)),
	    		pug.y + (game.rnd.integerInRange(-5, -10)), 
	    		'oldbubble'
	    	);

	    	exhaledBubbles.push(bubble);
	    }

	    // move/delete existing exhaled bubbles
	    var i;
	    for ( i = 0 ; i < exhaledBubbles.length ; ++i )
	    {
	    	exhaledBubbles[i].y -= screenVerticalMovement;
	    	exhaledBubbles[i].y -= 1;

	    	// remove those that floated off above
	    	if ( exhaledBubbles[i].y < -128 ) {
	    		exhaledBubbles[i].destroy();
	    		exhaledBubbles.splice(i, 1);
	    	}
	    }
	}



	function processNewBubbles ( screenVerticalMovement )
	{
		screenVerticalMovement = screenVerticalMovement || 0;

	    // new bubble?
	    if ( game.rnd.integerInRange(0, 100) < 2 )
	    {
	    	var bubble = game.add.sprite(
	    		game.rnd.integerInRange(0, width - 10),
	    		height,
	    		'bubble'
	    	);

	    	newBubbles.push(bubble);

	    	game.physics.enable(bubble, Phaser.Physics.ARCADE);
	    }

	    // move/delete new bubbles
	    for ( i = 0 ; i < newBubbles.length ; ++i )
	    {
	    	newBubbles[i].y -= screenVerticalMovement;
	    	newBubbles[i].y -= game.rnd.integerInRange(1, 3);

	    	// remove those that floated off above
	    	if ( newBubbles[i].y < -128 ) 
	    	{
	    		newBubbles[i].destroy();
	    		newBubbles.splice(i, 1);
	    	}
	    	else 
	    	{
	    		if ( intersects(newBubbles[i], pug) ) {
	    			air += 1;
	    			if ( air > 100 ) {
	    				air = 100;
	    			}
	    			newBubbles[i].destroy();
	    			newBubbles.splice(i, 1);
				}
	    	}
	    }
	}



	function playPunchAnimationIfNeeded()
	{
		if ( pugPunched ) 
		{
			pug.animations.play('fight', 30, true);
			pugPunched = false;
		}
	}



    function reduceAirWithTime()
    {
		if ( air > 0 ) 
		{
			air -= air_loss_rate;
			checkDeath();
		}
    }



    function checkDeath() 
    {
    	if ( air <= 0 ) 
    	{
    		air = 0;
    		alive = false;
    	}
    }



    function checkVictory()
    {
    	if ( nautilus.health <= 0 )
    	{
    		nautilus.health = 0;
    		victory = true;
    	}
    }



    function intersects(sprite1, sprite2) 
    {
		var xmin = sprite1.x >= sprite2.x ? sprite1.x : sprite2.x;
    	var xmax1 = sprite1.x + sprite1.width;
    	var xmax2 = sprite2.x + sprite2.width;
    	var xmax = xmax1 <= xmax2 ? xmax1 : xmax2;
    	
    	if ( xmax > xmin ) 
    	{
        	var ymin = sprite1.y >= sprite2.y ? sprite1.y : sprite2.y;
        	var ymax1 = sprite1.y + sprite1.height;
        	var ymax2 = sprite2.y + sprite2.height;
        	var ymax =  ymax1 <= ymax2 ? ymax1 : ymax2;
        	
        	if ( ymax > ymin ) {
            	return true;
        	}
    	}
    	
    	return false;
	}



	function closeEnoughToPunch(pug, target, checkIntersection) 
	{
		if ( checkIntersection && intersects(pug, target) ) return false;
		var pugCenterX = pug.x + (pug.width / 2);
		var pugCenterY = pug.y + (pug.height / 2);
		var targetCenterX = target.x + (target.width / 2);
		var targetCenterY = target.y + (target.height / 2);

		var distance = Math.sqrt(
			(pugCenterX - targetCenterX)*(pugCenterX - targetCenterX) + 
			(pugCenterY - targetCenterY)*(pugCenterY - targetCenterY)
		);

		return distance < ((pug.width / 2 + target.width / 2) + 60);
	}



	function updateRemainingAirDisplay()
	{
	    airtext.setText("Air: " + Math.floor(air) + "%");
	}




};
