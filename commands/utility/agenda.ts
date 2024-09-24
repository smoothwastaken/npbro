const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { exec } = require("child_process");
const dayjs = require("dayjs");
const formatPersonnalise = require("dayjs/plugin/customParseFormat");

import type { CommandInteraction, Embed } from "discord.js";

dayjs.extend(formatPersonnalise);

interface EvenementAgenda {
  jour: string;
  horaire: string;
  heureDebut: string;
  heureFin: string;
  salle: string;
  nom: string;
  professeur: string;
}

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const MOIS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];
const ABREVIATIONS_JOURS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const analyserHeure = (heure: string): string =>
  dayjs(heure, "hh:mm A").format("HH:mm");

const extraireEvenements = (sortieStandard: string): EvenementAgenda[] => {
  return sortieStandard
    .split("\n")
    .filter((ligne) => ligne.includes("TOULOUSE"))
    .map((ligne) => {
      const [jour, horaire, salle, nom, professeur] = ligne
        .split(/\s{2,}/)
        .filter(Boolean);
      const [heureDebut, heureFin] = horaire.split(" -> ").map(analyserHeure);
      return { jour, horaire, heureDebut, heureFin, salle, nom, professeur };
    });
};

const formatTitle = (rawJour: string): string => {
  const [semaineJour, mois, jour, annee] = rawJour.split(" ");
  const date = new Date(`${mois} ${jour} ${annee}`);
  let jourSemaine = "";
  switch (semaineJour) {
    case "Mon,":
      jourSemaine = "Lundi";
      break;
    case "Tue,":
      jourSemaine = "Mardi";
      break;
    case "Wed,":
      jourSemaine = "Mercredi";
      break;
    case "Thu,":
      jourSemaine = "Jeudi";
      break;
    case "Fri,":
      jourSemaine = "Vendredi";
      break;
    default:
      break;
  }

  const moisFr = MOIS[date.getMonth()];
  return `${jourSemaine} ${jour.replace(",", "")} ${moisFr} ${annee}`;
};

const creerEmbed = (jour: string, evenements: EvenementAgenda[]): Embed => {
  console.log("Events: " + evenements);
  const embed = new EmbedBuilder()
    .setColor(
      `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`
    )
    .setTitle(formatTitle(evenements[0].jour));

  if (evenements.length > 0) {
    const evenement = evenements[0];
    embed.addFields(
      { name: "Thème", value: `\`\`\`${evenement.nom}\`\`\`` },
      { name: "Salle", value: `\`\`\`${evenement.salle}\`\`\``, inline: true },
      {
        name: "Professeur",
        value: `\`\`\`${evenement.professeur}\`\`\``,
        inline: true,
      },
      {
        name: "Horaires",
        value: `\`\`\`${evenements
          .map((e) => `${e.heureDebut} - ${e.heureFin}`)
          .join("\n")}\`\`\``,
      }
    );
  }

  return embed;
};

const creerEmbeds = (evenements: EvenementAgenda[]): Embed[] => {
  return ABREVIATIONS_JOURS.map((abrevJour, index) => {
    const evenementsJour = evenements.filter((evenement) =>
      evenement.jour.includes(abrevJour)
    );
    return creerEmbed(JOURS[index], evenementsJour);
  });
};

const executerCommandeAgenda = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(
      "myges agenda",
      // { timeout: 5000 },
      (erreur: string, sortieStandard: string) => {
        if (erreur) {
          reject(`Erreur d'exécution : ${erreur}`);
        } else {
          resolve(sortieStandard);
        }
      }
    );
  });
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("agenda")
    .setDescription("Donne l'agenda de la semaine"),

  async execute(interaction: CommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const sortieStandard = await executerCommandeAgenda();
      const evenements = extraireEvenements(sortieStandard);
      const embeds = creerEmbeds(evenements);

      console.log(`[INFO] Agenda récupéré : ${evenements.length} événements`);

      await interaction.editReply({
        content: "Voici l'agenda de la semaine :",
        embeds: embeds,
      });
      console.log(`[INFO] Agenda envoyé à ${interaction.user.tag}`);
    } catch (erreur) {
      console.error(erreur);
      await interaction.editReply({
        content: "Une erreur est survenue lors de la récupération de l'agenda.",
      });
    }
  },
};
