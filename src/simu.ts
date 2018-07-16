import * as $ from "jquery";
import "jquery-ui/ui/widgets/slider";

function randomBoolean(): boolean {
	let outcome: number = Math.floor(Math.random() + 0.5);
	switch (outcome) {
		case 0:
			return false;
		case 1:
			return true;
	}
}
function randomInteger(begin: number, end: number): number {
	return Math.floor(Math.random() * (end - begin)) + begin;
}
function randomItem<T extends {}>(items: Array<T>): T {
	return items[randomInteger(0, items.length - 1)];
}

class Log {
	public events: Array<string> = new Array<string>();
}

class Universe {
	readonly reproductiveAgeBegin: number = 15;
	readonly reproductiveAgeEnd: number = 55;
	readonly fightingAgeBegin: number = 20;
	readonly fightingAgeEnd: number = 40;
	readonly matingAgeBegin: number = 16;
	readonly matingAgeEnd: number = 50;
	readonly casualtiesBeforeRetreat = 0.3;/* [0..1] - Percentage of deaths before one party retreats */
	readonly survivalByAge: [number, number][] = [[1, 0.2], [10, 0.4], [14, 0.5], [20, 0.6], [35, 0.8],
	 [45, 0.6], [60, 0.4], [80, 0.2], [100, 1]];/* [(age, probability to survive)] */
	public tribes: Tribe[] = [];
	constructor() {
		this.tribes = [];
	}
	public heartbeat(log: Log): void {
		for (let tribe of this.tribes) {
			tribe.heartbeat(this, log);
		}
	}
}

class Tribe {
	public readonly universe: Universe;
	public name: string;
	public individuals: Individual[] = [];
	public get males(): Individual[] {
		return this.individuals.filter(x => x.sex === Sex.Male);
	}
	public get females(): Individual[] {
		return this.individuals.filter(x => x.sex === Sex.Female);
	}
	public get fighters(): Individual[] {
		return this.individuals.filter(x => x.isFighter);
	}
	public sendFemalesIntoFight: boolean = false;
	public aggressiveness: number;/* [0..1] - How likely to attack if conditions allow; 1 always attack*/
	public underAttack: boolean = false;
	public allowsRebonding: boolean = true;/* Does the tribe allow forming of new mating bonds in case one of the partners dies */
	constructor(universe: Universe) {
		this.universe = universe;
		this.individuals = [];
	}
	public heartbeat(universe: Universe, log: Log): void {
		this.attack(universe.tribes.filter(x => x.name !== this.name), log);
		for (let individual of this.individuals) {
			individual.heartbeat(log);
		}
	}
	public clean(): void {
		let i: number = 0;
		while (i < this.individuals.length) {
			if (!this.individuals[i].alive) {
				this.individuals.splice(i, 1);
			}
			i++;
		}
	}
	private attack(tribes: Tribe[], log: Log): void {
		if (!this.underAttack && Math.random() <= this.aggressiveness) {
			let targetTribe: Tribe = this.findTargetTribe(tribes);
			if (!targetTribe) {
				return;
			}
			targetTribe.underAttack = true;
			let attackLog: string = `Tribe '${this.name}' (${this.fighters.length} fighters) has attacked village '${targetTribe.name}' (${targetTribe.fighters.length} fighters).`;
			let casualties: number = 0;
			let targetCasualties: number = 0;
			let thisCasualtiesBeforeRetreat: number = this.universe.casualtiesBeforeRetreat * this.fighters.length;
			let targetCasualtiesBeforeRetreat: number = this.universe.casualtiesBeforeRetreat * targetTribe.fighters.length;
			while ((casualties < thisCasualtiesBeforeRetreat || targetCasualties < targetCasualtiesBeforeRetreat) &&
				(this.fighters.length > 0 && targetTribe.fighters.length > 0)) {
				for (let individual of this.fighters) {
					individual.attack(targetTribe.fighters.filter(x => x.alive));
				}
				casualties += this.fighters.filter(x => !x.alive).length;
				targetCasualties += targetTribe.fighters.filter(x => !x.alive).length;
				this.clean();
				targetTribe.clean();
			}
			if (casualties === targetCasualties) {
				attackLog += ` Draw! ${casualties} vs ${targetCasualties} casualties.`;
			} else if (targetTribe.fighters.length === 0 || casualties < targetCasualties) {
				attackLog += ` Tribe '${this.name}' wins! ${casualties} vs ${targetCasualties} casualties.`;
			} else {
				attackLog += ` Tribe '${targetTribe.name}' wins! ${targetCasualties} vs ${casualties} casualties.`;
			}
			log.events.push(attackLog);
		}
	}
	private findTargetTribe = (tribes: Tribe[]): Tribe => {
		let suitableTargets: Tribe[] = tribes.filter(x => x.fighters.length <= this.fighters.length);
		if (suitableTargets.length === 0) {
			return null;
		}
		return randomItem(suitableTargets);
	}
}

enum Sex { Male, Female }

class Individual {
	public readonly tribe: Tribe;
	public get universe(): Universe {
		return this.tribe.universe;
	}
	public name: string;
	public age: number;
	public sex: Sex;
	public alive: boolean = true;
	public matingPartner: Individual;
	public get hasMatingPartner(): boolean {
		return this.matingPartner != null;
	}
	public isPregnant: boolean;
	public partner: Individual;
	public get isFighter(): boolean {
		return (this.sex === Sex.Male || this.tribe.sendFemalesIntoFight) &&
		 this.universe.fightingAgeBegin <= this.age && this.age <= this.universe.fightingAgeEnd;
	}
	public get canMate(): boolean {
		return this.universe.matingAgeBegin <= this.age && this.age <= this.universe.matingAgeEnd;
	 }
	constructor(tribe: Tribe) {
		this.tribe = tribe;
	}
	public heartbeat(log: Log): void {
		this.age++;
		if (Math.random() < this.probabilityToSurvive()) {
			this.alive = false;
			log.events.push(`Tribe '${this.tribe.name}' has lost one ${Sex[this.sex].toLowerCase()}, ${this.age} (non-war causes).`);
		}
		this.mate(log);
	}
	public attack(individuals: Individual[]): void {
		let targetIndividual: Individual = this.findTargetIndividual(individuals);
		if (!targetIndividual) {
			return;
		}
		let outcome: number = randomInteger(1, 3);// 1 - wins this individual, 2 draw, 3 wins targetIndividual
		switch (outcome) {
		case 1: targetIndividual.alive = false;
			break;
		case 2: this.alive = false;
			break;
		}
	}
	private findTargetIndividual = (individuals: Individual[]): Individual => {
		if (individuals.length === 0) {
			return null;
		}
		return randomItem(individuals);
	}
	private probabilityToSurvive = (): number => {
		let a: number, p: number, i: number = 0;
		do {
			a = this.universe.survivalByAge[i][0];
			p = this.universe.survivalByAge[i][1];
			i++;
		}
		while (this.age < a);
		return p;
	}
	public mate(log: Log): void {
		if (!this.canMate) {
			return;
		}
		if (!this.hasMatingPartner) {
			let mate: Individual = this.findMateIndividual();
			if (mate != null) {
				this.matingPartner = mate;
				mate.matingPartner = this;
				if (this.sex === Sex.Female) {
					this.isPregnant = true;
				} else {
					mate.isPregnant = true;
				}
				let newBorn: Individual = new Individual(this.tribe);
				newBorn.age = 0;
				newBorn.sex = randomBoolean() ? Sex.Male : Sex.Female;
				this.tribe.individuals.push(newBorn);
				log.events.push(`Tribe '${this.tribe.name}' has gain one ${Sex[this.sex].toLowerCase()}.`);
			}
		}
	}
	private findMateIndividual = (): Individual => {
		let suitableMates: Individual[] = this.tribe.individuals.filter(x => x.sex !== this.sex && !x.isPregnant);
		if (suitableMates.length === 0) {
			return null;
		}
		return randomItem(suitableMates);
	}
}

$(document).ready(() => {
	let numberOfHeartbeats: number = 30;
	let selectedHeartbeat: number = 0;
	$("#divSlider").slider({
		range: "max",
		min: 0,
		max: numberOfHeartbeats,
		value: 0,
		slide: (event, ui) => {
		}
	});
	let universe: Universe;
	function randomTribe(numberOfIndividuals: number): Tribe {
		let tribe: Tribe = new Tribe(universe);
		tribe.individuals = [];
		for (let i: number = 0; i < numberOfIndividuals; i++) {
			tribe.individuals[i] = new Individual(tribe);
			tribe.individuals[i].age = randomInteger(10, 30);
			tribe.individuals[i].sex = randomBoolean() ? Sex.Male : Sex.Female;
		}
		return tribe;
	}
	function newSimulation(): void {
		universe = new Universe();
		universe.tribes = [randomTribe(randomInteger(20, 40)),
		randomTribe(randomInteger(20, 40)),
		randomTribe(randomInteger(20, 40)),
		randomTribe(randomInteger(20, 40),),
		randomTribe(randomInteger(20, 40)),
		randomTribe(randomInteger(20, 40))];
		universe.tribes[0].name = "red";
		universe.tribes[0].aggressiveness = 0.3;
		universe.tribes[1].name = "blue";
		universe.tribes[1].aggressiveness = 0.2;
		universe.tribes[2].name = "green";
		universe.tribes[2].aggressiveness = 0.1;
		universe.tribes[3].name = "purple";
		universe.tribes[3].aggressiveness = 0.1;
		universe.tribes[4].name = "white";
		universe.tribes[4].aggressiveness = 0.1;
		universe.tribes[4].sendFemalesIntoFight = true;
		universe.tribes[5].name = "brown";
		universe.tribes[5].aggressiveness = 0.2;
		$("#divGraph").empty();
		$("#divLog").empty();
		let divInitialUniverse: JQuery = drawUniverse(universe);
		divInitialUniverse.find("h3").text("Initial state");
		$("#divGraph").append(divInitialUniverse.attr("id", getHeartbeatDivId(0)));
		for (let i: number = 1; i <= numberOfHeartbeats; i++) {
			let log: Log = new Log();
			log.events.push(`HEARTBEAT ${i}`);
			universe.heartbeat(log);
			let divUniverse: JQuery = drawUniverse(universe);
			divUniverse.find("h3").text("Heartbeat " + i);
			$("#divGraph").append(divUniverse.attr("id", getHeartbeatDivId(i)).hide());
		}
	}
	function drawIndividual(individual: Individual): JQuery {
		let divIndividual: JQuery;
		let title: string;
		if (individual.age < individual.universe.matingAgeBegin) {
			divIndividual = $("<i class='fa'>&#xf1ae;</i>");
			divIndividual.addClass("female");
			title = `${Sex[individual.sex]} child, `;
		} else {
			if (individual.sex === Sex.Female) {
				divIndividual = $("<i class='fa'>&#xf182;</i>");
				divIndividual.addClass("female");
				title = `${Sex[individual.sex]}, `;
			} else {
				divIndividual = $("<i class='fa'>&#xf183;</i>");
				divIndividual.addClass("male");
				title = `${Sex[individual.sex]}, `;
			}
			if (individual.isFighter) {
				divIndividual.addClass("fighter");
				title += "fighter, ";
			}
		}
		title += `${individual.age}.`;
		divIndividual.attr("title", title);
		return divIndividual;
	}
	function drawTribe(tribe: Tribe): JQuery {
		let divTribe: JQuery = $(`<div id='divTribe${tribe.name}'></div>`);
		divTribe.addClass("divTribe");
		divTribe.append(`<span>${tribe.name}: ${tribe.males.length + tribe.females.length}/(${tribe.males.length} M, ${tribe.females.length} F)</span><br/>`);
		divTribe.append(`<span>${tribe.fighters.length} fighters ${tribe.sendFemalesIntoFight ? "(F&#9876;)" : ""}</span><br/>`);
		for (let individual of tribe.individuals) {
			divTribe.append(drawIndividual(individual));
		}
		return divTribe;
	}
	function drawUniverse(universe: Universe): JQuery {
		let divUniverse: JQuery = $(`<div />`);
		divUniverse.append("<h3 />");
		for (let tribe of universe.tribes) {
			divUniverse.append(drawTribe(tribe));
		}
		return divUniverse;
	}
	function getHeartbeatDivId(heartbeat: number): string {
		return "divHeartbeat" + heartbeat;
	}
	newSimulation();
	$("#btnRun").click(() => {
		$("#btnRun").hide();
		let interval: number = setInterval(() => {
			let divCurrent: JQuery = $("#" + getHeartbeatDivId(selectedHeartbeat));
			if (selectedHeartbeat < numberOfHeartbeats) {
				selectedHeartbeat++;
				let divNext: JQuery = $("#" + getHeartbeatDivId(selectedHeartbeat));
				divCurrent.toggle();
				divNext.toggle();
				$("#divSlider").slider("option", "value", selectedHeartbeat);
			} else {
				$("#btnRun").show();
				clearInterval(interval);
			}
		}, 500);
	});
	$("#btnNew").click(() => {
		selectedHeartbeat = 0;
		newSimulation();
		$("#btnRun").show();
		$("#divSlider").slider("option", "value", selectedHeartbeat);
	});
	$("#divSlider").on("slide", (event, ui) => {
		let divCurrent: JQuery = $("#" + getHeartbeatDivId(selectedHeartbeat));
		let sliderValue: number = ui.value;
		let divNext: JQuery = $("#" + getHeartbeatDivId(sliderValue));
		divCurrent.toggle();
		divNext.toggle();
		selectedHeartbeat = sliderValue;
	});
});