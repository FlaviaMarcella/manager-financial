package com.aws.studentbuilder.finance.service;

import com.aws.studentbuilder.finance.entity.PapelUsuario;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationService.class);

    private final JavaMailSender mailSender;

    @Value("${app.initial-admin-email:studentbuildergroup@gmail.com}")
    private String adminEmail;

    @Value("${spring.mail.username:studentbuildergroup@gmail.com}")
    private String fromEmail;

    public EmailNotificationService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void notificarAdminNovaSolicitacao(String nome, String email) {
        String assunto = "[AWS SBG Finance] Nova Solicitação de Acesso Pendente";
        String html = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 8px;">
                <div style="background-color: #151D25; padding: 15px; text-align: center; border-radius: 6px;">
                    <h2 style="color: #FF9900; margin: 0;">AWS SBG Finance</h2>
                </div>
                <div style="padding: 20px 0;">
                    <h3 style="color: #151D25;">Nova Solicitação de Acesso</h3>
                    <p style="color: #475569;">Um novo membro realizou login social via Google e aguarda autorização no portal:</p>
                    <div style="background-color: #F8FAFC; padding: 15px; border-radius: 6px; border-left: 4px solid #FF9900; margin: 15px 0;">
                        <p style="margin: 5px 0;"><strong>Nome:</strong> %s</p>
                        <p style="margin: 5px 0;"><strong>E-mail:</strong> %s</p>
                    </div>
                    <p style="color: #475569;">Para aprovar ou recusar este acesso, acesse o painel de administração:</p>
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="https://aws-sbg-finance.duckdns.org/usuarios" style="background-color: #FF9900; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Gerenciar Acessos</a>
                    </div>
                </div>
                <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #94A3B8; text-align: center;">AWS Student Builder Group &bull; Governança e Gestão Financeira</p>
            </div>
            """.formatted(nome, email);

        enviarEmail(adminEmail, assunto, html);
    }

    @Async
    public void notificarUsuarioSolicitacaoRecebida(String nome, String email) {
        String assunto = "[AWS SBG Finance] Solicitação de Acesso em Análise";
        String html = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 8px;">
                <div style="background-color: #151D25; padding: 15px; text-align: center; border-radius: 6px;">
                    <h2 style="color: #FF9900; margin: 0;">AWS SBG Finance</h2>
                </div>
                <div style="padding: 20px 0;">
                    <h3 style="color: #151D25;">Olá, %s!</h3>
                    <p style="color: #475569;">Recebemos sua solicitação de acesso ao sistema de Gestão Financeira do <strong>AWS Student Builder Group</strong>.</p>
                    <div style="background-color: #FFFDF0; border: 1px solid #FFE082; padding: 15px; border-radius: 6px; margin: 15px 0;">
                        <p style="color: #B78103; margin: 0; font-weight: bold;">⏳ Status: Aguardando Aprovação</p>
                        <p style="color: #5D4037; font-size: 13px; margin: 5px 0 0 0;">Por razões de confidencialidade e segurança, a liderança do grupo precisa autorizar seu perfil.</p>
                    </div>
                    <p style="color: #475569;">Assim que sua solicitação for aprovada, você receberá um novo e-mail e poderá acessar o portal imediatamente.</p>
                </div>
                <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #94A3B8; text-align: center;">AWS Student Builder Group &bull; Governança e Gestão Financeira</p>
            </div>
            """.formatted(nome);

        enviarEmail(email, assunto, html);
    }

    @Async
    public void notificarUsuarioAprovacao(String nome, String email, PapelUsuario papel) {
        String papelNome = papel == PapelUsuario.ADMIN ? "Administrador (Acesso Total)" : "Membro / Leitor (VIEWER)";
        String assunto = "[AWS SBG Finance] Seu Acesso foi Aprovado! 🎉";
        String html = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 8px;">
                <div style="background-color: #151D25; padding: 15px; text-align: center; border-radius: 6px;">
                    <h2 style="color: #00E582; margin: 0;">AWS SBG Finance</h2>
                </div>
                <div style="padding: 20px 0;">
                    <h3 style="color: #151D25;">Boas-vindas, %s!</h3>
                    <p style="color: #475569;">Sua solicitação de acesso foi <strong>APROVADA</strong> com sucesso pela administração.</p>
                    <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; padding: 15px; border-radius: 6px; margin: 15px 0;">
                        <p style="color: #166534; margin: 0;"><strong>Perfil Autorizado:</strong> %s</p>
                    </div>
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="https://aws-sbg-finance.duckdns.org" style="background-color: #FF9900; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Acessar o Sistema</a>
                    </div>
                </div>
                <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #94A3B8; text-align: center;">AWS Student Builder Group &bull; Governança e Gestão Financeira</p>
            </div>
            """.formatted(nome, papelNome);

        enviarEmail(email, assunto, html);
    }

    @Async
    public void notificarUsuarioRejeicao(String nome, String email) {
        String assunto = "[AWS SBG Finance] Atualização sobre sua Solicitação de Acesso";
        String html = """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 8px;">
                <div style="background-color: #151D25; padding: 15px; text-align: center; border-radius: 6px;">
                    <h2 style="color: #FF9900; margin: 0;">AWS SBG Finance</h2>
                </div>
                <div style="padding: 20px 0;">
                    <h3 style="color: #151D25;">Olá, %s</h3>
                    <p style="color: #475569;">Informamos que sua solicitação de acesso ao AWS SBG Finance não foi autorizada no momento.</p>
                    <p style="color: #475569;">Se você acredita que isto é um engano, entre em contato com a equipe organizadora respondendo a este e-mail.</p>
                </div>
                <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #94A3B8; text-align: center;">AWS Student Builder Group &bull; Governança e Gestão Financeira</p>
            </div>
            """.formatted(nome);

        enviarEmail(email, assunto, html);
    }

    private void enviarEmail(String destinatario, String assunto, String htmlBody) {
        if (mailSender == null) {
            logger.info("[E-MAIL SIMULADO] Para: {} | Assunto: {}", destinatario, assunto);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail != null ? fromEmail : "studentbuildergroup@gmail.com", "AWS SBG Finance");
            helper.setTo(destinatario);
            helper.setSubject(assunto);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            logger.info("E-mail enviado com sucesso para: {} com assunto: {}", destinatario, assunto);
        } catch (Exception e) {
            logger.warn("Não foi possível enviar e-mail para {}: {}. Verifique as credenciais SMTP.", destinatario, e.getMessage());
        }
    }
}