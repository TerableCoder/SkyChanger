module.exports = function SkyChanger(mod){
	mod.game.initialize(["me"]);
	const command = mod.command || mod.require.command;
	
	const AERO = mod.settings.aero;
	let skyNum = mod.settings.defaultSky,
		TPed = false,
		timer;
	skyNum++; // 12 +1
	
	mod.hook('S_AERO', 1, (e) => { // find new skies
		if(AERO.indexOf(e.aeroSet) == -1 && mod.settings.newSky.indexOf(e.aeroSet) == -1 ){
			mod.settings.newSky.push(e.aeroSet);
			command.message(`New sky found! ${e.aeroSet}.`);
			command.message(`New Sky Index = ${mod.settings.newSky.length -1}.`);
		}
	});
	
	mod.hook('C_LOAD_TOPO_FIN', 1, (e) => {
		TPed = true;
    });
	
	mod.hook('C_VISIT_NEW_SECTION', 1, (e) => {
        if(mod.settings.reapply && TPed){
			TPed = false;
			mod.setTimeout(() => {
				skyNum--;
				changeSky();
			}, 80);
        }
    });
	
	command.add('sky', (arg1, arg2, arg3) => {
		switch (arg1){
		case 'stop':
			clearInterval(timer);
			command.message('Sky Cycle Stopped.');
		break;
		
		case 'delay':
			arg2 = parseInt(arg2);
			if(!isNaN(arg2)) mod.settings.cycleTime = arg2;
			command.message(`Time per Cycle is ${mod.settings.cycleTime}.`);
		break;
		
		case 'reapply':
			mod.settings.reapply = !mod.settings.reapply;
			command.message(`Sky reapply is ${mod.settings.reapply}.`);
		break;
		
		case 'clear':
		case 'reset':
			resetSky();
		break;
		
		case 'default':
			arg2 = parseInt(arg2);
			if(!isNaN(arg2)) mod.settings.defaultSky = arg2;
			command.message(`Default Sky is ${mod.settings.defaultSky}.`);
		break;
		
		case 'newsky':
		case 'ns':
			if(arg2 && arg2 == 'cycle'){
				if(!arg3 || !isNaN(arg3) && arg3 > 0 || arg < 708) skyNum = arg3;
				timer = setInterval(cycle, mod.settings.cycleTime)
			} else{
				if(!arg2 || isNaN(arg2) || arg2 < 1 || arg2 > 707) skyNum = 1;
				else skyNum = arg2;
				changeSky();
			}
		break;
		
		default:
			if(arg1 && arg1 == 'cycle'){
				if(!arg2 || !isNaN(arg2) && arg2 > 0 || arg < 708) skyNum = arg2;
				timer = setInterval(cycle, mod.settings.cycleTime)
			} else{
				if(!arg1 || isNaN(arg1) || arg1 < 1 || arg1 > 707) skyNum = 1;
				else skyNum = arg1;
				changeSky();
			}
		}
	});
	
	function changeSky(){
		resetSky();
		command.message('Sky # ' + skyNum);
		mod.send('S_AERO', 1, {enabled: 1, blendTime: mod.settings.transitionTime, aeroSet: AERO[skyNum]});
		skyNum++;
	}
	
	function cycle(){
		if(skyNum == AERO.length) skyNum = 1;
		changeSky();
	}
	
	function resetSky(){
		mod.send('S_AERO', 1, {enabled: 0, blendTime: 0, aeroSet: ''});
	}
};