$.page("index", function () {
  var i = 0;
  $("button").click(function () {
    i++;
    $("#cube").removeClass("r0 r1 r2 r3");
    $("#cube").addClass("r" + (i % 4));
    $("#cube").css("transform", `rotate(${i * -90}deg)`);
  });

  var l = 0;
  var t = 0;
  /*
  $(window).keydown(function(e) {
    console.log(e.keyCode);
    if (e.keyCode === 40) {
      setInterval(function() {
        t++;
        $('#cube').css({
          top: t * 25,
        });
      }, 1000);
    }
    if (e.keyCode === 39) {
      l++;
      $('#cube').css({
        'left': l * 50,
      });
    }
    if (e.keyCode === 37) {
      l--;
      $('#cube').css({
        'left': l * 50,
      });
    }
    if (e.keyCode === 38) {
      i++;
      $('#cube').removeClass('r0 r1 r2 r3');
      $('#cube').addClass('r' + (i % 4));
      $('#cube').css('transform', `rotate(${i*-90}deg)`);
    }
  });
  */

  var interval;
  var event;

  let board = [
    [".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", "."],
  ];

  const shapes = {
    L: { draw: [["X", "."], ["X", "X"]] },
    I: { draw: [[".", ".", "."], ["X", "X", "X"], [".", ".", "."]] },
    O: { draw: [["X", "X"], ["X", "X"]] },
    S: { draw: [["X", "X", "."], [".", "X", "X"], ['.', '.', '.']] },
  };

  _.each(shapes, (s, k) => {
    s.rotations = [
      extractValues(s, 0),
      extractValues(s, 1),
      extractValues(s, 2),
      extractValues(s, 3),
    ];
  });


  let currentShape = {
    rotations: shapes.S.rotations,
    $el: $('.cube'),
    type: 'S',
  };

  function extractValues(s, times) {
    const out = [];
    _.each(rotateArray(s.draw, times), (col, r) => {
      _.each(col, (val, c) => {
        if (val === 'X') {
          out.push([c,r]);
        }
      });
    });
    return out;
  }

  function rotateArray(_matrix, times) {
    const matrix = _.clone(_matrix);

    for (var i = 0; i < (4 - times); i++ ) {
      const N = matrix.length - 1;
      const result = matrix.map((row, i) =>
        row.map((val, j) => matrix[N - j][i])
      );
      matrix.length = 0;       // hold original array reference
      matrix.push(...result);  // Spread operator
    }
    return matrix;
  }

  var top = 0;
  var left = 0;
  var r = 0;

  function place(moveTop, moveSide, rotation, confirm) {
    var _board = _.cloneDeep(board);
    var done = false;

    _shape = rotate(r + rotation);

    _.each(_shape, (pos) => {
      if (
        !_board[pos[1] + top + moveTop] ||
        !_board[pos[1] + top][pos[0] + left + moveSide] ||
        _board[pos[1] + top + moveTop][pos[0] + left + moveSide] === "X"
      ) {
        done = true;
      } else {
        _board[pos[1] + top + moveTop][pos[0] + left + moveSide] = "X";
      }
    });
    if (done) {
      return false;
    }
    return _board;
  }

  const notifications = {
    'gmail': ['Test <test@test.com>', 'Hey, wanted to throw some time on your calendar to go over the Q2 planning'],
    'slack': ['Greg (@greg)', 'Have a few minutes for a quick catchup?'],
    'zoom': ['Zoom', 'James has invited you to a Zoom meeting'],
  };

  function updateActive() {
    currentShape.$el.removeClass('r0 r1 r2 r3');
    currentShape.$el.addClass(`r${r % 4}`);
    currentShape.$el.css('transform', `rotate(${r*-90}deg)`);
    currentShape.$el.css('left', 50 * left);
    currentShape.$el.css('top', 50 * top);
  }

  function randomArray(a, curr) {
    let sample = _.clone(a);

    if (curr) {
      // Make it so there's a better chance we don't repeat
      sample = sample.concat(_.remove(_.clone(a), (o) => o !== curr));
      sample = sample.concat(_.remove(_.clone(a), (o) => o !== curr));
      sample = sample.concat(_.remove(_.clone(a), (o) => o !== curr));
      sample = sample.concat(_.remove(_.clone(a), (o) => o !== curr));
    }

    return sample[Math.floor(Math.random() * sample.length)];
  }

  function createNewShape() {
    currentShape.type = randomArray(Object.keys(shapes), currentShape.type);

    currentShape.rotations = shapes[currentShape.type].rotations;
    currentShape.$el = $('.cube').eq(0).clone();
    currentShape.$el.removeClass(Object.keys(shapes).map(v => `shape-${v}`).join(' ')).addClass(`shape-${currentShape.type}`);

    // So bigger shapes don't slide off the side
    if (left + shapes[currentShape.type].draw[0].length > 7) {
      left = 7 - shapes[currentShape.type].draw[0].length;
    }
    if (left < 0) left = 0;

    updateActive();

    setTimeout(function() {
      var $event = $('#event');

      event = randomArray(Object.keys(notifications), event);

      $('#event strong').text(notifications[event][0]);
      $('#event p').text(notifications[event][1]);

      $event.removeClass(Object.keys(notifications).join(' ')).addClass(event);
      $('#event').addClass('on');
    }, 500);

    setTimeout(() => $('#event').removeClass('on'), 3000);

    $('#calendar').append(currentShape.$el);
  }

  function move(moveTop, moveSide, rotation) {
    var _board = place(moveTop, moveSide, rotation, false);
    console.log(_board);
    if (_board) {
    console.log('a1');
      top += moveTop;
      left += moveSide;
      r += rotation;

      updateActive();
    console.log('a2');

      showBoard(_board);
    } else {
    console.log('a3');
      if (moveTop) {
        console.log("TURN OVER");

        console.log("CURRENT", currentShape.type);

        console.log(left);

        // Turn over!
        board = place(0, 0, 0);
        top = 0;
        //left = 0;

        r = 0;

        createNewShape();

        _board = place(0, 0, 0);
    console.log('a4');
        showBoard(_board);
      }
    }
  }

  function rotate(i) {
    return currentShape.rotations[i % 4];
  }

  function slide(i) {
    left += i;
  }

  function showBoard(_board) {
    console.log(_board.map((i) => i.join("")).join("\n"));
  }

  /*
  function rotate() {
    shape = [[0,1], [1,1], [1,0]];
  }
  */

  $(window).keydown(function (e) {
    if (e.keyCode === 40) {
      move(1, 0, 0, false);
    }
    if (e.keyCode === 39) {
      move(0, 1, 0, false);
    }
    if (e.keyCode === 37) {
      move(0, -1, 0, false);
    }
    if (e.keyCode === 38) {
      move(0, 0, 1, false);
      /*
      i++;
      $('#cube').removeClass('r0 r1 r2 r3');
      $('#cube').addClass('r' + (i % 4));
      $('#cube').css('transform', `rotate(${i*-90}deg)`);
      */
    }
    if (e.keyCode === 13) {
      if(interval) return;
      createNewShape();
      interval = setInterval(function () {
        move(1, 0, 0, false);
      }, 800);
    }
  });
});
