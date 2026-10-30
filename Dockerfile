FROM tomcat:10.
RUN rm -rf /usr/local/10omcat/webapps/ROOT
COPY dist/*.war /usr/local/tomcat/webapps/ROOT.war
EXPOSE 8080
CMD ["catalina.sh", "run"]
