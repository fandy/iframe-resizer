define(['iframeResizerContent','jquery'], function(mockMsgListener,$) {

	function createMsg(msg){
		return {
			data:'[iFrameSizer]'+msg,
			source:{
				postMessage: function(msg){
					if(log){
						console.log('PostMessage: '+msg);
					}
				}
			}
		}
	}

	window.iFrameResizer = {
		messageCallback: function(msg){msgCalled = msg;},
		readyCallback:   function(){window.parent.readyCalled = true;alert('ready')},
		targetOrigin:    '*'
	};

	$(window.document.body).append('<a href="#foo" id="bar"></a>');

	var
		id        = 'parentIFrameTests',
		log       = true,
		msg       = '8:true:'+log+':0:true:false:null:max:wheat:null:0:true:child:scroll'
		msgObject = createMsg(id+':'+msg),
		win       = mockMsgListener(msgObject);

	window.msgCalled   = null;
	window.readyCalled = false;

	beforeEach(function(){
		spyOn(msgObject.source,'postMessage');
		spyOn(window.iFrameResizer,'messageCallback');
		spyOn(window.iFrameResizer,'readyCallback');
		spyOn(console,'log');
		spyOn(console,'warn');
	});

	afterAll(function(){
		win.parentIFrame.close();
	})


	describe('ParentIFrame methods: ', function() {

		it('autoResize',function(){
			win.parentIFrame.autoResize(true);
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Add event listener: Animation Start');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Add event listener: Animation Iteration');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Add event listener: Animation End');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Add event listener: Orientation Change');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Add event listener: Input');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Add event listener: Print');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Add event listener: Transition End');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Add event listener: Mouse Up');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Add event listener: Mouse Down');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Add event listener: IFrame Resized');
			win.parentIFrame.autoResize(false);
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Remove event listener: Animation Start');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Remove event listener: Animation Iteration');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Remove event listener: Animation End');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Remove event listener: Orientation Change');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Remove event listener: Input');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Remove event listener: Print');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Remove event listener: Transition End');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Remove event listener: Mouse Up');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Remove event listener: Mouse Down');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Remove event listener: IFrame Resized');
		});

		it('Get ID of iFrame is same as iFrame', function() {
			expect(win.parentIFrame.getId()).toBe(id);
		});

		it('move to anchor', function() {
			win.parentIFrame.moveToAnchor('foo');
			expect(msgObject.source.postMessage).toHaveBeenCalledWith('[iFrameSizer]parentIFrameTests:0:0:inPageLink:#foo', '*');
			win.parentIFrame.moveToAnchor('bar');
			expect(msgObject.source.postMessage.calls.argsFor(1)[0]).toContain(':scrollToOffset');
		});

		it('reset', function() {
			win.parentIFrame.reset();
			expect(msgObject.source.postMessage.calls.argsFor(0)[0]).toContain(':reset');
		});

		it('scrollTo', function() {
			win.parentIFrame.scrollTo(10,10);
			expect(msgObject.source.postMessage).toHaveBeenCalledWith('[iFrameSizer]parentIFrameTests:10:10:scrollTo', '*');
		});

		it('scrollToOffset', function() {
			win.parentIFrame.scrollToOffset(10,10);
			expect(msgObject.source.postMessage).toHaveBeenCalledWith('[iFrameSizer]parentIFrameTests:10:10:scrollToOffset', '*');
		});

		it('sendMessage (string)', function() {
			win.parentIFrame.sendMessage('foo:bar');
			expect(msgObject.source.postMessage).toHaveBeenCalledWith('[iFrameSizer]parentIFrameTests:0:0:message:"foo:bar"', '*');
		});

		it('sendMessage (object)', function() {
			win.parentIFrame.sendMessage({foo:'bar'});
			expect(msgObject.source.postMessage).toHaveBeenCalledWith('[iFrameSizer]parentIFrameTests:0:0:message:{"foo":"bar"}', '*');
		});

		it('setTargetOrigin', function() {
			var targetOrigin = 'http://foo.bar:1337'
			win.parentIFrame.setTargetOrigin(targetOrigin);
			win.parentIFrame.size(10,10);
			expect(msgObject.source.postMessage).toHaveBeenCalledWith('[iFrameSizer]parentIFrameTests:10:10:size', targetOrigin);
			win.parentIFrame.setTargetOrigin('*');
		});

	});

	describe('inbound message: ', function() {

		xit('readyCallack', function() {
			expect(window.iFrameResizer.readyCallback).toHaveBeenCalled();
		});

		it('message (String)', function() {
			var msg = 'foo';
			mockMsgListener(createMsg('message:'+JSON.stringify(msg)));
			expect(msgCalled).toBe(msg);
		});

		it('message (Object)', function() {
			var msg = {foo:'bar'};
			mockMsgListener(createMsg('message:'+JSON.stringify(msg)));
			expect(msgCalled.foo).toBe('bar');
		});

		it('reset', function(done) {
			setTimeout(function(){ //Wait for init lock to clear
				mockMsgListener(createMsg('reset'));
				expect(msgObject.source.postMessage.calls.argsFor(0)[0]).toContain(':reset');
				done();
			},200);
		});

		it('resize(max)', function() {
			win.parentIFrame.setHeightCalculationMethod('max');
			mockMsgListener(createMsg('resize'));
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Trigger event: Parent window requested size check');
			});

		it('resize(lowestElement)', function() {
			win.parentIFrame.setHeightCalculationMethod('lowestElement');
			mockMsgListener(createMsg('resize'));
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Trigger event: Parent window requested size check');
		});

		it('move to anchor', function() {
			mockMsgListener(createMsg('moveToAnchor:foo'));
			expect(msgObject.source.postMessage).toHaveBeenCalledWith('[iFrameSizer]parentIFrameTests:0:0:inPageLink:#foo', '*');
		});

		it('unexpected message', function() {
			mockMsgListener(createMsg('foo'));
			expect(console.warn).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Unexpected message ([iFrameSizer]foo)');
		});

	});


	describe('performance: ', function() {

		it('trottles',function(done){
			win.parentIFrame.size(10,10);
			win.parentIFrame.size(20,10);
			win.parentIFrame.size(30,10);
			win.parentIFrame.size(40,10);
			win.parentIFrame.size(50,10);
			win.parentIFrame.size(60,10);
			setTimeout(function(){
				//expect(msgObject.source.postMessage).toHaveBeenCalledWith('[iFrameSizer]parentIFrameTests:10:10:size', '*');
				expect(msgObject.source.postMessage).not.toHaveBeenCalledWith('[iFrameSizer]parentIFrameTests:20:10:size', '*');
				expect(msgObject.source.postMessage).not.toHaveBeenCalledWith('[iFrameSizer]parentIFrameTests:30:10:size', '*');
				expect(msgObject.source.postMessage).not.toHaveBeenCalledWith('[iFrameSizer]parentIFrameTests:40:10:size', '*');
				expect(msgObject.source.postMessage).not.toHaveBeenCalledWith('[iFrameSizer]parentIFrameTests:50:10:size', '*');
				expect(msgObject.source.postMessage).toHaveBeenCalledWith('[iFrameSizer]parentIFrameTests:60:10:size', '*');
				done();
			},17);
		});

	});


	describe('height calculation methods: ', function() {

		it('invalid',function() {
			win.parentIFrame.setHeightCalculationMethod('foo');
			expect(console.warn).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] foo is not a valid option for heightCalculationMethod.');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] height calculation method set to "bodyOffset"');
			win.parentIFrame.size();
		});

		it('bodyOffset',function(done) {
			setTimeout(function(){
				win.parentIFrame.setHeightCalculationMethod('bodyOffset');
				win.parentIFrame.size();
				done();
			},10);
		});

		it('offset',function(done) {
			setTimeout(function(){
				win.parentIFrame.setHeightCalculationMethod('offset');
				win.parentIFrame.size();
				done();
			},20);
		});

		it('bodyScroll',function(done) {
			setTimeout(function(){
				win.parentIFrame.setHeightCalculationMethod('bodyScroll');
				win.parentIFrame.size();
				done();
			},30);
		});

		it('documentElementOffset',function(done) {
			setTimeout(function(){
				win.parentIFrame.setHeightCalculationMethod('documentElementOffset');
				win.parentIFrame.size();
				done();
			},40);
		});

		it('documentElementScroll',function(done) {
			setTimeout(function(){
				win.parentIFrame.setHeightCalculationMethod('documentElementScroll');
				win.parentIFrame.size();
				done();
			},50);
		});

		it('max',function(done) {
			setTimeout(function(){
				win.parentIFrame.setHeightCalculationMethod('max');
				win.parentIFrame.size();
				done();
			},60);
		});

		it('min',function(done) {
			setTimeout(function(){
				win.parentIFrame.setHeightCalculationMethod('min');
				win.parentIFrame.size();
				done();
			},70);
		});

		it('grow',function(done) {
			setTimeout(function(){
				win.parentIFrame.setHeightCalculationMethod('grow');
				win.parentIFrame.size();
				done();
			},80);
		});

		it('lowestElement',function(done) {
			setTimeout(function(){
				win.parentIFrame.setHeightCalculationMethod('lowestElement');
				win.parentIFrame.size();
				done();
			},90);
		});

		it('taggedElement',function(done) {
			setTimeout(function(){
				win.parentIFrame.setHeightCalculationMethod('taggedElement');
				win.parentIFrame.size();
				done();
			},100);
		});

	});


	describe('width calculation methods: ', function() {

		it('invalid',function() {
			win.parentIFrame.setWidthCalculationMethod('foo');
			expect(console.warn).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] foo is not a valid option for widthCalculationMethod.');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] width calculation method set to "scroll"');
			win.parentIFrame.size();
		});

		it('bodyOffset',function(done) {
			setTimeout(function(){
				win.parentIFrame.setWidthCalculationMethod('bodyOffset');
				win.parentIFrame.size();
				done();
			},110);
		});

		it('bodyScroll',function(done) {
			setTimeout(function(){
				win.parentIFrame.setWidthCalculationMethod('bodyScroll');
				win.parentIFrame.size();
				done();
			},120);
		});

		it('documentElementOffset',function(done) {
			setTimeout(function(){
				win.parentIFrame.setWidthCalculationMethod('documentElementOffset');
				win.parentIFrame.size();
				done();
			},130);
		});

		it('documentElementScroll:',function(done) {
			setTimeout(function(){
				win.parentIFrame.setWidthCalculationMethod('documentElementScroll:');
				win.parentIFrame.size();
				done();
			},140);
		});

		it('scroll',function(done) {
			setTimeout(function(){
				win.parentIFrame.setWidthCalculationMethod('scroll');
				win.parentIFrame.size();
				done();
			},150);
		});

		it('max',function(done) {
			setTimeout(function(){
				win.parentIFrame.setWidthCalculationMethod('max');
				win.parentIFrame.size();
				done();
			},160);
		});

		it('min',function(done) {
			setTimeout(function(){
				win.parentIFrame.setWidthCalculationMethod('min');
				win.parentIFrame.size();
				done();
			},170);
		});

		it('leftMostElement',function(done) {
			setTimeout(function(){
				win.parentIFrame.setWidthCalculationMethod('leftMostElement');
				win.parentIFrame.size();
				done();
			},180);
		});

		it('taggedElement',function(done) {
			setTimeout(function(){
				win.parentIFrame.setWidthCalculationMethod('taggedElement');
				win.parentIFrame.size();
				done();
			},190);
		});
	});


});
