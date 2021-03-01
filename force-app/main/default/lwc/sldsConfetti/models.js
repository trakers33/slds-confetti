/**
 * Created by trakers on 28.02.21.
 */

const emojiConfetti = function(emoji){
  var duration = 5 * 1000;
  var animationEnd = Date.now() + duration;
  var skew = 1;

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  (function frame() {
    var timeLeft = animationEnd - Date.now();
    var ticks = Math.max(200, 500 * (timeLeft / duration));
    skew = Math.max(0.8, skew - 0.001);

    confetti({
      particleCount: 1,
      startVelocity: 0,
      ticks: ticks,
      gravity: 0.5,
      origin: {
        x: Math.random(),
        // since particles fall down, skew start toward the top
        y: (Math.random() * skew) - 0.2
      },
      shapes: [emoji],
      scalar: randomInRange(0.4, 1)
    });

    if (timeLeft > 0) {
      requestAnimationFrame(frame);
    }
  }());
}

export const confetti_models = {
  'firework':function(){
    let duration = 15 * 1000;
    let animationEnd = Date.now() + duration;

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    let interval = setInterval(function() {
      let timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      let particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti(Object.assign({ startVelocity: 30, spread: 360, ticks: 60}, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({ startVelocity: 30, spread: 360, ticks: 60}, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  },
  'schoolPride':function(){
    let end = Date.now() + (7 * 1000);
    let colors = ['#bb0000', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  },
  'emoji':function(params){
    if(params.emoji){
      emojiConfetti(`emoji:${params.emoji}`);
    }else{
      console.error('emoji incorrect',params);
    }
  },
  'default':function(){
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  },
}