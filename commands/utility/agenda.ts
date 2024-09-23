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
const ABREVIATIONS_JOURS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const analyserHeure = (heure: string): string =>
  dayjs(heure, "hh:mm A").format("HH:mm");

const extraireEvenements = (sortieStandard: string): EvenementAgenda[] => {
  return sortieStandard
    .replace(
      "Loading agenda from 22-09-2024 to 29-09-2024...\n[36mDay[39m                       [36mSchedule[39m               [36mRoom(s)[39m               [36mName[39m                                                [36mTeacher[39m       \n",
      ""
    )
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

const creerEmbed = (jour: string, evenements: EvenementAgenda[]): Embed => {
  const embed = new EmbedBuilder()
    .setColor(Math.floor(Math.random() * 16777215).toString(16))
    .setTitle(jour);

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
    exec("myges agenda", (erreur: string, sortieStandard: string) => {
      if (erreur) {
        reject(`Erreur d'exécution : ${erreur}`);
      } else {
        resolve(sortieStandard);
      }
    });
  });
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("agenda")
    .setDescription("Donne l'agenda de la semaine"),

  async execute(interaction: CommandInteraction) {
    try {
      const sortieStandard = await executerCommandeAgenda();
      const evenements = extraireEvenements(sortieStandard);
      const embeds = creerEmbeds(evenements);

      await interaction.reply({
        content: "Voici l'agenda de la semaine :",
        ephemeral: true,
        embeds: embeds,
      });
    } catch (erreur) {
      console.error(erreur);
      await interaction.reply({
        content: "Une erreur est survenue lors de la récupération de l'agenda.",
        ephemeral: true,
      });
    }
  },
};
