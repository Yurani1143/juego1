class Escena extends Phaser.Scene {

    constructor(){
      super('init');
    }

    preload() {
      this.load.image('fondo','img/fondo.jpg');
      this.load.spritesheet('bird', 'img/bird.png', {frameWidth: 60, frameHeight: 60});

      this.load.image('tuberias0', 'img/tuberia1.png');
      this.load.image('tuberiasArriba0', 'img/tuberiaArriba.JPG');
      this.load.image('tuberiasAbajo0', 'img/tuberiaAbajo1.png');

      this.load.image('tuberias1', 'img/tuberia2.png');
      this.load.image('tuberiasArriba1', 'img/tuberiaArrriba2.png');
      this.load.image('tuberiasAbajo1', 'img/tuberiaAbajo2.png');

      this.load.audio('music', 'music/bosque.mp3');

    

    }

    create() {

      this.bg = this.add.tileSprite(480, 320, 960, 640, 'fondo').setScrollFactor(0);
      this.player = this.physics.add.sprite(50, 100, 'bird');

      let sonido = this.sound.add('music');
      sonido.play();


      this.anims.create(
        {
            key:'volar',
            frames: this.anims.generateFrameNumbers('bird', {start: 0, end: 1}),
            frameRate:7,
            repeat:-1,
        }
      );

      this.player.play('volar');

      this.anims.create({
        key: 'saltar',
        frames: this.anims.generateFrameNumbers('bird', {start: 2, end: 2}),
        frameRate: 7,
        repeat: 1,
      });


      this.input.keyboard.on('keydown', (event) => {
        if (event.keyCode === 32) {
            this.saltar();
        }
      });

      this.input.on('pointerdown', () => this.saltar());

      this.player.on('animationcomplete', this.animationComplete, this);

      this.nuevaColumna();

      this.physics.world.on('worldbounds', (body) => {
        this.scene.start('perderScene');
      });
    
      this.player.setCollideWorldBounds(true);
      this.player.body.onWorldBounds = true;

    }

    update(time){
      this.bg.tilePositionX = time*0.1;
    }

    nuevaColumna() {
      //Una columna es un grupo de cubos
      const columna = this.physics.add.group();
      //Cada columna tendrá un hueco (zona en la que no hay cubos) por dónde pasará el super héroe
      const hueco = Math.floor(Math.random() * 5) + 1;
      const aleatorio = Math.floor(Math.random() * 2);


      for (let i = 0; i < 8; i++) {
          //El hueco estará compuesto por dos posiciones en las que no hay cubos, por eso ponemos hueco +1
          //if (i !== hueco && i !== hueco + 1 && i !== hueco - 1) {
            if(i !== hueco && i !== hueco + 1 && i !== hueco - 1){
              let cubo;
              if (i == hueco - 2) {
                cubo = columna.create(960, i * 100, 'tuberiasArriba' + aleatorio);
              } else if (i == hueco + 2) {
                cubo = columna.create(960, i * 100, 'tuberiasAbajo' + aleatorio);             
              } else {
                cubo = columna.create(960, i * 100,'tuberias'+ aleatorio);
              }

              cubo.body.allowGravity = false;
          }
      }
      columna.setVelocityX(-200);
      //Detectaremos cuando las columnas salen de la pantalla...
      columna.checkWorldBounds = true;
      //... y con la siguiente línea las eliminaremos
      columna.outOfBoundsKill = true;
      //Cada 1000 milisegundos llamaremos de nuevo a esta función para que genere una nueva columna
      this.time.delayedCall(1000, this.nuevaColumna, [], this);

      this.physics.add.overlap(this.player, columna, this.hitColumna, null, this);

    }

    hitColumna() {
      this.scene.start('perderScene');
    }

    animationComplete(animation, frame, sprite) {
      if (animation.key === 'saltar') {
          this.player.play('volar');
      }
    }

    saltar() {
      this.player.setVelocityY(-200);
      this.player.play('saltar');
    }
}

class PerderEscena extends Phaser.Scene {
  constructor(){
    super({key: 'perderScene'});
  }

  preload(){
    this.load.image('perder', 'img/gameover.jpg');
  }

  create(){
    this.add.image(480,320,'perder');
    this.input.on('pointerdown', () => this.volverAJugar())

  }

  volverAJugar(){
    this.scene.start('init');
  }

}



const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 640,
    scene: [Escena,PerderEscena],
    scale: {
		mode: Phaser.Scale.FIT
    },
    physics: {
		default: 'arcade',
		arcade: {
			gravity: {
				y: 500
			},
		}
	},
};

new Phaser.Game(config);

