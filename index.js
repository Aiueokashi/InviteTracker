const http =require('http')
http 
    .createServer(function(req,res){
      res.write("test");
      res.end();
    }).listen(8080);
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const db = require('quick.db');
const yaml = require("js-yaml");
const { mainprefix } = yaml.load(fs.readFileSync("./config.yml"));
const owners = require('./owners.json')
client.on('ready', async () => console.log(`ready!`))
const guildInvites = new Map();
const GUILD = '760785556803944448'
const CHANNEL = '768834402758557767'

client.on("inviteCreate", async invite =>
  guildInvites.set(invite.guild.id, await invite.guild.fetchInvites())
);
client.on("ready", () => {
  const textguild = client.guilds.cache.get(GUILD)
   const textchannel = client.channels.cache.get(CHANNEL)
   textchannel.setName('メンバー数: ' + textguild.memberCount)
  client.guilds.cache.forEach(guild => {
    guild
      .fetchInvites()
      .then(invites => guildInvites.set(guild.id, invites))
      .catch(err => console.log(err));
  });
});
const { defaultjoinmessage, defaultleavemessage } = yaml.load(
  fs.readFileSync("./config.yml")
);
client.on("guildMemberAdd", async member => {
     if (member.guild.id === GUILD) {
     const textchannel = member.guild.channels.cache.get(CHANNEL)
     textchannel.setName('メンバー数: ' + member.guild.memberCount)
   }
  let joinchannelmessage = db.get(`joinchannelmessage_${member.guild.id}`);
  if (!joinchannelmessage === null) {
    return console.log(`None`);
  }
  let joinmessage = db.get(`joinchannelmessage_${member.guild.id}`);
  if (joinmessage === null) joinmessage = defaultjoinmessage;

  const catchedInvites = guildInvites.get(member.guild.id);
  const newInvites = await member.guild.fetchInvites();
  guildInvites.set(member.guild.id, newInvites);
  try {
    const usedInvite = newInvites.find(
      inv => catchedInvites.get(inv.code).uses < inv.uses
    );
    db.add(`invites_${member.guild.id}_${usedInvite.inviter.id}`, 1);
    db.set(`inviter_${member.id}`, usedInvite.inviter.id);
    let inv = db.fetch(`invites_${member.guild.id}_${usedInvite.inviter.id}`);
    let joinmessage2 = defaultjoinmessage
      .toLowerCase()
      .replace("{user}", member.user.tag)
      .replace("{user}", member.user.tag)
      .replace("{user}", member.user.tag)
      .replace("{user}", member.user.tag)
      .replace("{user}", member.user.tag)
      .replace("{user}", member.user.tag)
      .replace("{user}", member.user.tag)
      .replace("{inviter}", usedInvite.inviter.tag)
      .replace("{inviter}", usedInvite.inviter.tag)
      .replace("{inviter}", usedInvite.inviter.tag)
      .replace("{inviter}", usedInvite.inviter.tag)
      .replace("{inv}", inv)
      .replace("{inv}", inv)
      .replace("{inv}", inv)
      .replace("{inv}", inv)
      .replace("{inv}", inv)
      .replace("{inv}", inv);


    db.add(`jointimes_${member.guild.id}_${member.id}`, 1);
    db.add(`Regular_${member.guild.id}_${usedInvite.inviter.id}`, 1);
    client.channels.cache.get(joinchannelmessage).send(joinmessage2);
  } catch (err) {
    console.log(err);
  }
});

client.on("guildMemberRemove", member => {
     if (member.guild.id === GUILD) {
     const textchannel = member.guild.channels.cache.get(CHANNEL)
     textchannel.setName('メンバー数: ' + member.guild.memberCount)
   }
  let leavechannel = db.get(`leavechannelmessage_${member.guild.id}`);
  if (leavechannel === null) {
    return console.log(`nope!`);
  }
  let leavemssage = db.get(`leavemessage_${member.guild.id}`);
  if (leavemssage === null) leavemssage = defaultleavemessage;

  let inviter2 = db.fetch(`inviter_${member.id}`);
  const iv2 = client.users.cache.get(inviter2);
  const mi = member.guild.members.cache.get(inviter2);
  db.subtract(`invites_${member.guild.id}_${inviter2}`, 1);
  if (!inviter2) {
    client.channels.cache
      .get(leavechannel)
      .send(`${member} が退出したけど誰が招待したのか分からなかったよ`);
    return;
  }
  let leavemssage2 = leavemssage
    .toLowerCase()
    .replace("{user}", member.user.tag)
    .replace("{user}", member.user.tag)
    .replace("{user}", member.user.tag)
    .replace("{user}", member.user.tag)
    .replace("{inviter}", `<@${inviter2}>`)
    .replace("{inviter}", `<@${inviter2}>`)
    .replace("{inviter}", `<@${inviter2}>`)
    .replace("{inviter}", `<@${inviter2}>`)
    .replace("{inviter}", `<@${inviter2}>`);

  db.add(`leaves_${member.guild.id}_${inviter2}`, 1);
  client.channels.cache.get(leavechannel).send(leavemssage2);
});
client.on('message', async message => {
  let prefix = await db.get(`guildprefix_${message.guild.id}`);
  if (prefix === null) prefix = mainprefix;
    if(message.content.startsWith(prefix + 'config')) {
        let args = message.content.split(' ');
      if (!message.member.hasPermission("MANAGE_GUILD")&&!owners.includes(message.author.id))
        return message.channel.send(
          "You need `MANAGE GUILD` to configure the server settings!"
        );
      let content = args[1];
      if (!content) {
        let kk = new Discord.MessageEmbed()
          .setColor(`RANDOM`)
          .setTitle(`${message.guild.name} Settings`)
          .setDescription(`
        \`\`\`${prefix}config [key] [value]\`\`\`
        \`joinMessageChannel\`,\`leaveMessageChannel\`,\`prefix\`,\`show\`,\`reset-invites <@User>\`,\`resetall-invites\`,\`add-invites\``
          )
          .setFooter(message.guild.name, client.user.displayAvatarURL());
       return message.channel.send(kk);
      }
      if (content.toLowerCase() === "prefix") {
        let prefixembed = new Discord.MessageEmbed()
             .setColor(`RANDOM`)
          .setTitle(`**SetPrefix**`)
          .setDescription(
            `This Config is Currently Set.
        Use \`\`\`${prefix}config prefix <value>\`\`\` to change it.
        **Current Value**
        \`\`\`${prefix}\`\`\`
        `
          )
          .setFooter(message.guild.name, client.user.displayAvatarURL());
        let newprefix = args[2];
  
        if (!newprefix) {
          return message.channel.send(prefixembed);
        }
        let changedprefix = new Discord.MessageEmbed()
          .setTitle(`**Prefix Updated**`)
               .setColor(`RANDOM`)
          .setDescription(
            `** Old Value **\n${prefix}\n** New Value **\n${newprefix}`
          )
          .setFooter(message.guild.name, client.user.displayAvatarURL());
        db.delete(`guildprefix_${message.guild.id}`);
        db.set(`guildprefix_${message.guild.id}`, newprefix);
        return message.channel.send(changedprefix);
      } if (content.toLowerCase() === "joinmessagechannel") {
        let joinchannelmessagedata = db.get(
          `joinchannelmessage_${message.guild.id}`
        );
        if (joinchannelmessagedata === null) joinchannelmessagedata = "none";
        let joinchannel = message.mentions.channels.first();
        let joinchannelmessage = new Discord.MessageEmbed()
          .setTitle(`** joinMessageChannel **`)
          .setColor(`RANDOM`)
          .setDescription(
            `This config is currently set.
          Use \`\`\`${prefix}config joinMessageChannel #channel\`\`\` to change it.
          **Current Value**
          <#${joinchannelmessagedata}>
          `
          )
          .setFooter(message.guild.name, client.user.displayAvatarURL());
        if (!joinchannel) {
          return message.channel.send(joinchannelmessage);
        }
        const joinmessageupdated = new Discord.MessageEmbed()
          .setTitle(`**JoinMessageChannel Updated**`)
          .setColor(`RANDOM`)
          .setDescription(
            `** Old Value **\n<#${joinchannelmessagedata}>\n** New Value **\n<#${joinchannel.id}>`
          )
          .setFooter(message.guild.name, client.user.displayAvatarURL());
        db.delete(`joinchannelmessage_${message.guild.id}`);
        db.set(`joinchannelmessage_${message.guild.id}`, joinchannel.id);
        return message.channel.send(joinmessageupdated);
      }
      if (content.toLowerCase() === "leavemessagechannel") {
        let leavechanneldata = db.get(`leavechannelmessage_${message.guild.id}`);
        if (leavechanneldata === null) leavechanneldata = "none";
  
        let leavechannel = message.mentions.channels.first();
        let leavemessageembed = new Discord.MessageEmbed()
          .setTitle(`** LeaveMessageChannel **`)
           .setColor(`RANDOM`)
          .setDescription(
            `This config is currently set.
          Use \`\`\`${prefix}config LeaveMessageChannel #channel\`\`\` to change it.
          **Current Value**
          <#${leavechanneldata}>
          `
          )
          .setFooter(message.guild.name, client.user.displayAvatarURL());
        if (!leavechannel) {
          return message.channel.send(leavemessageembed);
        }
        const leavemessageupdated = new Discord.MessageEmbed()
          .setTitle(`**LeaveChannelMessage Updated**`)
             .setColor(`RANDOM`)
          .setDescription(
            `** Old Value **\n<#${leavechanneldata}>\n** New Value **\n<#${leavechanneldata.id}>`
          )
          .setFooter(message.guild.name, client.user.displayAvatarURL());
        db.delete(`leavechannelmessage_${message.guild.id}`);
        db.set(`leavechannelmessage_${message.guild.id}`, leavechannel.id);
        return message.channel.send(leavemessageupdated);
      }
      if (content.toLowerCase() === "show") {
        let joinmessage = db.get(`joinmessage_${message.guild.id}`);
        if (joinmessage === null) joinmessage = defaultjoinmessage;
        let leavemessage = db.get(`leavemessage_${message.guild.id}`);
        if (leavemessage === null) leavemessage = defaultleavemessage;
        let joinchannelmessage = db.get(`joinchannelmessage_${message.guild.id}`);
        let joinchannelmessage2 = db.get(
          `joinchannelmessage_${message.guild.id}`
        );
        if (joinchannelmessage === null) joinchannelmessage = "None";
        else joinchannelmessage = `<#${joinchannelmessage2}>`;
        let leavechannelmessage = db.get(
          `leavechannelmessage_${message.guild.id}`
        );
        let leavechannelmessage2 = db.get(
          `leavechannelmessage_${message.guild.id}`
        );
        if (leavechannelmessage === null) leavechannelmessage = "None";
        else leavechannelmessage = `<#${leavechannelmessage2}>`;
        let guildconfig = new Discord.MessageEmbed()
          .setAuthor(
            `${message.guild.name} Server Settings.`,
            message.author.displayAvatarURL()
          )
             .setColor(`RANDOM`)
          .addField(`Prefix`, `\`${prefix}\``, true)
          .addField(`JoinMessage`, `\`${joinmessage}\``, true)
          .addField(`LeaveMessage`, `\`${leavemessage}\``, true)
          .addField(`JoinMessageChannel`, `${joinchannelmessage}`, true)
          .addField(`LeaveMessageChannel`, `${leavechannelmessage}`, true)
          .setFooter(client.user.username, client.user.displayAvatarURL());
       
        return message.channel.send(guildconfig);
      }
    }
  });
client.on('message', async message => {
  let prefix = db.get(`prefix_${message.guild.id}`)
    if(prefix === null) prefix = mainprefix;
    if(message.content.startsWith(prefix + 'invites')) {
      let user = message.mentions.users.first() || message.author;
  
      if (!user) return message.channel.send(`**Usage CMD: ${prefix}invites \`<@User>\`**`)
      let inv = db.fetch(`invites_${message.guild.id}_${user.id}`);
      let leaves = db.fetch(`leaves_${message.guild.id}_${user.id}`);
      let Regular = db.fetch(`Regular_${message.guild.id}_${user.id}`);
      let bonus = db.fetch(`bouns_${message.guild.id}_${user.id}`);
      
      const embeds = new Discord.MessageEmbed()
        .setColor(`RANDOM`)
        .setDescription(`**You Have **\`${inv || 0}\`** Invites (**\`${Regular || 0}\`** Regular **\`${bonus || 0}\`** Bonus **\`${leaves || 0}\`**Leaves )**`)
        .setFooter(user.tag, user.avatarURL({ dynamic: true }));
      
        message.channel.send(embeds);
    }
  });

  client.on('message', async message => {
    let prefix = db.get(`prefix_${message.guild.id}`)
    if(prefix === null) prefix = mainprefix;
    if(message.content.startsWith(prefix + 'config')){
      let args = message.content.split(' ');
      let content = args[1];
      if (content.toLowerCase() === "add-invites") {
        if (!message.member.hasPermission("MANAGE_GUILD")&&!owners.includes(message.author.id)) return message.channel.send("You need `MANAGE GUILD` to add invites!");

   let amount = args[3];

   if (!amount) return message.channel.send(`**Usage CMD: ${prefix}add-invites \`<@User>\` \`<Numberinvites>\`**`);

   let user = message.mentions.users.first();

   if (!user) return message.channel.send(`**Usage CMD: ${prefix}add-invites \`<@User>\` \`<Numberinvites>\`**`);

   db.add(`invites_${message.guild.id}_${user.id}`, amount);

   db.add(`bouns_${message.guild.id}_${user.id}`, amount);
 return message.channel.send(`**Done Added \`${amount}\` To ${user}**`);
}
 }
})
  client.on('message', async message => {
    let prefix = db.get(`prefix_${message.guild.id}`);
    if(prefix === null) prefix = mainprefix
    if(message.content.startsWith(prefix + 'config')){
      let args = message.content.split(' ')
      let content = args[1];
      if (content.toLowerCase() === "resetall-invites") {
        let inv = db.fetch(`invites_${message.guild.id}_${message.author.id}`);
      let leaves = db.fetch(`leaves_${message.guild.id}_${message.author.id}`);
      let Regular = db.fetch(`Regular_${message.guild.id}_${message.author.id}`);
      let bonus = db.fetch(`bouns_${message.guild.id}_${message.author.id}`);      
      if (!message.member.hasPermission("MANAGE_GUILD")&&!owners.includes(message.author.id)) return message.channel.send("You need `MANAGE GUILD` to remove invites!");
       
      message.guild.members.cache.forEach(user => {
       db.delete(`invites_${message.guild.id}_${user.user.id}`);
       db.delete(`leaves_${message.guild.id}_${user.user.id}`);
       db.delete(`Regular_${message.guild.id}_${user.user.id}`);
       db.delete(`bouns_${message.guild.id}_${user.user.id}`);         
    })
    return message.channel.send(`**Done Has Been Reset invites**`) 
}
    }
  });

  client.on('message', async message => {
    let prefix = db.get(`prefix_${message.guild.id}`)
    if(prefix === null) prefix = mainprefix
    if(message.content.startsWith(prefix + 'config')){
      let args = message.content.split(' ')
      let content = args[1];
      if (content.toLowerCase() === "reset-invites") {
        if (!message.member.hasPermission("MANAGE_GUILD")&&!owners.includes(message.author.id)) return message.channel.send("You need `MANAGE GUILD` to remove invites!");
      let user = message.mentions.users.first();

      let inv = db.fetch(`invites_${message.guild.id}_${message.author.id}`);
      let leaves = db.fetch(`leaves_${message.guild.id}_${message.author.id}`);
      let Regular = db.fetch(`Regular_${message.guild.id}_${message.author.id}`);
      let bonus = db.fetch(`bouns_${message.guild.id}_${message.author.id}`);      

       if(!user) return message.channel.send(`**Usage CMD: ${prefix}reset-invites \`<@user>\`**`);

       db.delete(`invites_${message.guild.id}_${user.id}`);
       db.delete(`leaves_${message.guild.id}_${user.id}`);
       db.delete(`Regular_${message.guild.id}_${user.id}`);
       db.delete(`bouns_${message.guild.id}_${user.id}`);         
     return message.channel.send(`**Done Has Been Reset invites This User**`) 
      }
    }
  });



  client.login(process.env.token)
